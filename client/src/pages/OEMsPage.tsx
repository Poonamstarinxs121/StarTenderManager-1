import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Search, Plus, Download, FileText, MoreHorizontal, AlertCircle } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
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
import AddOEMModal from "@/components/oems/AddOEMModal";

// This would be replaced with real API types
interface OEM {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  status: string;
}

export default function OEMsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingOEM, setEditingOEM] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [oemToDelete, setOEMToDelete] = useState<number | null>(null);
  
  // Fetch OEMs
  const { data: oems = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/oems'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/oems');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error("Failed to fetch OEMs:", error);
        return [];
      }
    }
  });
  
  // Delete OEM mutation
  const deleteOEMMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/oems/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "OEM deleted",
        description: "The OEM has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/oems'] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete OEM: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle edit button click
  const handleEditClick = (id: number) => {
    setEditingOEM(id);
    setAddModalOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (id: number) => {
    setOEMToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setEditingOEM(null);
    setAddModalOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (oemToDelete) {
      deleteOEMMutation.mutate(oemToDelete);
    }
  };
  
  // Use demo data if API returns empty
  const useDemo = !isLoading && Array.isArray(oems) && oems.length === 0 && !searchQuery;
  
  // Demo OEMs for empty state
  const demoOEMs: OEM[] = [
    {
      id: 1,
      name: "Electronic Innovations",
      contactPerson: "Sarah Miller",
      email: "sarah@electronicinnovations.com",
      phone: "+1 555-123-4567",
      category: "Electronics",
      status: "Active"
    },
    {
      id: 2,
      name: "Advanced Machinery",
      contactPerson: "Michael Brown",
      email: "michael@advancedmachinery.com",
      phone: "+1 555-987-6543",
      category: "Machinery",
      status: "Active"
    },
    {
      id: 3,
      name: "GreenTech Solutions",
      contactPerson: "Linda Garcia",
      email: "linda@greentechsolutions.com",
      phone: "+1 555-444-3333",
      category: "Renewable Energy",
      status: "Inactive"
    }
  ];
  
  const displayOEMs = useDemo ? demoOEMs : oems;
  
  const filteredOEMs = displayOEMs.filter((oem) => 
    oem.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    oem.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    oem.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // If using demo data and no OEMs are available, show empty state with add button
  if (useDemo) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-medium">Original Equipment Manufacturers (OEMs)</h2>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add OEM
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>OEM List</CardTitle>
            <div className="flex items-center mt-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search OEMs..."
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
              <h3 className="text-lg font-semibold mb-2">No OEMs Found</h3>
              <p className="text-muted-foreground mb-4 max-w-md text-center">
                You haven't added any OEMs yet. Click "Add OEM" to create your first OEM record.
              </p>
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First OEM
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Add OEM Modal */}
        <AddOEMModal 
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          editId={editingOEM}
          onSuccess={refetch}
        />
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                OEM and all associated data.
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
        <h2 className="text-2xl font-medium">Original Equipment Manufacturers (OEMs)</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add OEM
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>OEM List</CardTitle>
          <div className="flex items-center mt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search OEMs..."
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
              <p>Loading OEMs...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OEM Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOEMs.map((oem) => (
                  <TableRow key={oem.id}>
                    <TableCell className="font-medium">{oem.name}</TableCell>
                    <TableCell>{oem.contactPerson}</TableCell>
                    <TableCell>{oem.email}</TableCell>
                    <TableCell>{oem.phone}</TableCell>
                    <TableCell>{oem.category}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        oem.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {oem.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(oem.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteClick(oem.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOEMs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No OEMs found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Add OEM Modal */}
      <AddOEMModal 
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        editId={editingOEM}
        onSuccess={refetch}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              OEM and all associated data.
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