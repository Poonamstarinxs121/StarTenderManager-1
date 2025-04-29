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
  CalendarDays, 
  ArrowUpRight,
  Filter,
  AlertCircle
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import AddLeadModal from "@/components/leads/AddLeadModal";

// This would be replaced with real API types
interface Lead {
  id: number;
  title: string;
  company: string;
  contactPerson: string;
  source: string;
  value: number;
  status: "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Closed";
  createdAt: string;
  dueDate: string;
}

export default function LeadsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<number | null>(null);
  
  // Fetch Leads
  const { data: leadsData = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/leads'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/leads');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        return [];
      }
    }
  });
  
  // Delete Lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/leads/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Lead deleted",
        description: "The lead has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete lead: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle edit button click
  const handleEditClick = (id: number) => {
    setEditingLead(id);
    setAddModalOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (id: number) => {
    setLeadToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setEditingLead(null);
    setAddModalOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (leadToDelete) {
      deleteLeadMutation.mutate(leadToDelete);
    }
  };
  
  // Use demo data if API returns empty
  const useDemo = !isLoading && Array.isArray(leadsData) && leadsData.length === 0 && !searchQuery;
  
  // Demo Leads for empty state
  const demoLeads: Lead[] = [
    {
      id: 1,
      title: "New Office Building Project",
      company: "Global Construction Ltd.",
      contactPerson: "James Wilson",
      source: "Website Inquiry",
      value: 250000,
      status: "New",
      createdAt: "2023-12-01",
      dueDate: "2023-12-30"
    },
    {
      id: 2,
      title: "Hospital Equipment Upgrade",
      company: "MediCare Solutions",
      contactPerson: "Sarah Johnson",
      source: "Trade Show",
      value: 500000,
      status: "Contacted",
      createdAt: "2023-11-15",
      dueDate: "2023-12-20"
    },
    {
      id: 3,
      title: "School Renovation Contract",
      company: "City Education Department",
      contactPerson: "Michael Brown",
      source: "Referral",
      value: 750000,
      status: "Qualified",
      createdAt: "2023-11-10",
      dueDate: "2023-12-15"
    },
    {
      id: 4,
      title: "Commercial Mall Development",
      company: "Urban Developers Inc.",
      contactPerson: "Emily Chen",
      source: "LinkedIn",
      value: 1200000,
      status: "Proposal",
      createdAt: "2023-10-20",
      dueDate: "2023-12-10"
    },
    {
      id: 5,
      title: "Airport Terminal Expansion",
      company: "National Airports Authority",
      contactPerson: "Robert Taylor",
      source: "Direct Contact",
      value: 3500000,
      status: "Negotiation",
      createdAt: "2023-09-15",
      dueDate: "2023-12-05"
    }
  ];
  
  // Use demo data if API returns empty results
  const leads = useDemo ? demoLeads : leadsData;

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusColor = (status: Lead["status"]) => {
    switch(status) {
      case "New": return "bg-blue-100 text-blue-800";
      case "Contacted": return "bg-purple-100 text-purple-800";
      case "Qualified": return "bg-teal-100 text-teal-800";
      case "Proposal": return "bg-amber-100 text-amber-800";
      case "Negotiation": return "bg-orange-100 text-orange-800";
      case "Closed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Lead Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Leads Pipeline</CardTitle>
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search leads..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{lead.title}</span>
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{lead.contactPerson}</TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>${lead.value.toLocaleString()}</TableCell>
                  <TableCell className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1 text-muted-foreground" />
                    {new Date(lead.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(lead.status)} border-0`}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditClick(lead.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDeleteClick(lead.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No leads found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Leads</p>
                <h3 className="text-2xl font-bold mt-1">{leads.filter(l => l.status === "New").length}</h3>
              </div>
              <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">N</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualified Leads</p>
                <h3 className="text-2xl font-bold mt-1">{leads.filter(l => l.status === "Qualified").length}</h3>
              </div>
              <div className="bg-teal-100 h-8 w-8 rounded-full flex items-center justify-center">
                <span className="text-teal-600 text-sm font-bold">Q</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Proposal Stage</p>
                <h3 className="text-2xl font-bold mt-1">{leads.filter(l => l.status === "Proposal").length}</h3>
              </div>
              <div className="bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-sm font-bold">P</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pipeline Value</p>
                <h3 className="text-2xl font-bold mt-1">
                  ${leads.reduce((sum, lead) => sum + lead.value, 0).toLocaleString()}
                </h3>
              </div>
              <div className="bg-green-100 h-8 w-8 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Lead Modal */}
      <AddLeadModal 
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        editId={editingLead}
        onSuccess={refetch}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              lead and all associated data.
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