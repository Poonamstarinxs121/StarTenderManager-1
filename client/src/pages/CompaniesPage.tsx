import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Search, Plus, Download, AlertCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import AddCompanyModal from "@/components/companies/AddCompanyModal";

// This would be replaced with real API types
interface Company {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  status: string;
}

export default function CompaniesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);
  
  // Fetch companies
  const { data: companies = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        return [];
      }
    }
  });
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/companies/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Company deleted",
        description: "The company has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete company: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle edit button click
  const handleEditClick = (id: number) => {
    setEditingCompany(id);
    setAddModalOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (id: number) => {
    setCompanyToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setEditingCompany(null);
    setAddModalOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (companyToDelete) {
      deleteCompanyMutation.mutate(companyToDelete);
    }
  };
  
  // Use demo data if API returns empty
  const useDemo = !isLoading && Array.isArray(companies) && companies.length === 0 && !searchQuery;
  
  // Demo companies for empty state
  const demoCompanies: Company[] = [
    {
      id: 1,
      name: "Tech Solutions Inc.",
      contactPerson: "John Smith",
      email: "john.smith@techsolutions.com",
      phone: "+1 123-456-7890",
      location: "New York, USA",
      status: "Active"
    },
    {
      id: 2,
      name: "Global Innovations Ltd.",
      contactPerson: "Emma Johnson",
      email: "emma.j@globalinnovations.co.uk",
      phone: "+44 20 1234 5678",
      location: "London, UK",
      status: "Active"
    },
    {
      id: 3,
      name: "Pacific Systems",
      contactPerson: "Robert Chen",
      email: "robert@pacificsystems.com",
      phone: "+1 987-654-3210",
      location: "San Francisco, USA",
      status: "Inactive"
    }
  ];
  
  const displayCompanies = useDemo ? demoCompanies : companies;
  
  const filteredCompanies = displayCompanies.filter((company) => 
    company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // If using demo data and no companies are available, show empty state with add button
  if (useDemo) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-medium">Companies</h2>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Company List</CardTitle>
            <div className="flex items-center mt-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search companies..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Companies Found</h3>
              <p className="text-muted-foreground mb-4 max-w-md text-center">
                You haven't added any companies yet. Click "Add Company" to create your first company record.
              </p>
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Company
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Add Company Modal */}
        <AddCompanyModal 
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          editId={editingCompany}
          onSuccess={refetch}
        />
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                company and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Companies</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Company List</CardTitle>
          <div className="flex items-center mt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search companies..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading companies...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.contactPerson}</TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>{company.phone}</TableCell>
                    <TableCell>{company.location}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        company.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {company.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditClick(company.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteClick(company.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCompanies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No companies found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Add Company Modal */}
      <AddCompanyModal 
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        editId={editingCompany}
        onSuccess={refetch}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              company and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}