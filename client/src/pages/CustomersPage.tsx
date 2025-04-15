import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Edit, 
  Trash, 
  Search, 
  Plus, 
  Download, 
  Mail, 
  Phone, 
  Eye, 
  MoreVertical,
  AlertCircle
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AddCustomerModal from "@/components/customers/AddCustomerModal";

// This would be replaced with real API types
interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  type: string;
  lastContact: string;
}

export default function CustomersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  
  // Fetch Customers
  const { data: customersData = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/customers');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        return [];
      }
    }
  });
  
  // Delete Customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/customers/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Customer deleted",
        description: "The customer has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete customer: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle edit button click
  const handleEditClick = (id: number) => {
    setEditingCustomer(id);
    setAddModalOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (id: number) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setEditingCustomer(null);
    setAddModalOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      deleteCustomerMutation.mutate(customerToDelete);
    }
  };
  
  // Use demo data if API returns empty
  const useDemo = !isLoading && Array.isArray(customersData) && customersData.length === 0 && !searchQuery;
  
  // Demo Customers for empty state
  const demoCustomers: Customer[] = [
    {
      id: 1,
      name: "Alice Richardson",
      company: "Global Industries",
      email: "alice@globalindustries.com",
      phone: "+1 555-123-4567",
      status: "Active",
      type: "Corporate",
      lastContact: "2023-11-15"
    },
    {
      id: 2,
      name: "David Chen",
      company: "Pacific Solutions",
      email: "david.chen@pacificsolutions.com",
      phone: "+1 555-987-6543",
      status: "Active",
      type: "Government",
      lastContact: "2023-12-01"
    },
    {
      id: 3,
      name: "Emily Johnson",
      company: "Eco Innovations",
      email: "emily@ecoinnovations.org",
      phone: "+1 555-456-7890",
      status: "Inactive",
      type: "Non-profit",
      lastContact: "2023-10-22"
    },
    {
      id: 4,
      name: "Mohammed Al-Farsi",
      company: "United Development",
      email: "mohammed@uniteddev.com",
      phone: "+971 55 123 4567",
      status: "Active",
      type: "Corporate",
      lastContact: "2023-12-10"
    }
  ];
  
  const customers = useDemo ? demoCustomers : customersData;
  
  const filteredCustomers = customers
    .filter((customer) => 
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((customer) => {
      if (activeTab === "all") return true;
      if (activeTab === "active") return customer.status === "Active";
      if (activeTab === "inactive") return customer.status === "Inactive";
      return true;
    });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Customers</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Customers</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search customers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle>Customer List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.company}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" /> {customer.email}
                          </span>
                          <span className="flex items-center text-sm mt-1">
                            <Phone className="h-3 w-3 mr-1" /> {customer.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{customer.type}</TableCell>
                      <TableCell>{new Date(customer.lastContact).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          customer.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No customers found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle>Active Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Same table content as above but filtered for active customers */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.company}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" /> {customer.email}
                          </span>
                          <span className="flex items-center text-sm mt-1">
                            <Phone className="h-3 w-3 mr-1" /> {customer.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{customer.type}</TableCell>
                      <TableCell>{new Date(customer.lastContact).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          {customer.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle>Inactive Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Same table content as above but filtered for inactive customers */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.company}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" /> {customer.email}
                          </span>
                          <span className="flex items-center text-sm mt-1">
                            <Phone className="h-3 w-3 mr-1" /> {customer.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{customer.type}</TableCell>
                      <TableCell>{new Date(customer.lastContact).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          {customer.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}