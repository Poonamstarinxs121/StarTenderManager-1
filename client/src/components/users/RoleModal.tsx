import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Edit, Trash } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Role form schema
const roleFormSchema = z.object({
  name: z.string().min(2, { message: "Role name must be at least 2 characters." }),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface Role {
  id: number;
  name: string;
  description?: string;
  usersCount?: number;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleModal({
  isOpen,
  onClose,
}: RoleModalProps) {
  const { toast } = useToast();
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  
  // Mock roles - in a real app, this would come from the API
  const mockRoles: Role[] = [
    { id: 1, name: "Admin", description: "Full system access", usersCount: 2 },
    { id: 2, name: "Manager", description: "Can manage projects and users", usersCount: 5 },
    { id: 3, name: "User", description: "Regular user access", usersCount: 15 },
    { id: 4, name: "Guest", description: "Limited read-only access", usersCount: 8 }
  ];
  
  // In a real implementation, we would use this query
  // const { data: roles = [], isLoading } = useQuery({
  //   queryKey: ['/api/roles'],
  //   queryFn: async () => {
  //     try {
  //       const response = await fetch('/api/roles');
  //       if (!response.ok) {
  //         throw new Error(`Error: ${response.status}`);
  //       }
  //       const data = await response.json();
  //       return data || [];
  //     } catch (error) {
  //       console.error("Failed to fetch roles:", error);
  //       return [];
  //     }
  //   }
  // });
  
  // For now, use the mock data
  const roles = mockRoles;
  const isLoading = false;
  
  // Default form values
  const defaultValues: RoleFormValues = {
    name: "",
    description: "",
  };
  
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues,
  });
  
  // Add/edit role mutation (disabled for mock)
  const mutation = useMutation({
    mutationFn: async (data: RoleFormValues) => {
      // In a real app, this would make an API call
      // For now, just simulate success
      return new Promise<Role>((resolve) => {
        // Simulate API delay
        setTimeout(() => {
          const newRole = {
            id: editingRoleId || roles.length + 1,
            name: data.name,
            description: data.description,
            usersCount: 0,
          };
          resolve(newRole);
        }, 500);
      });
    },
    onSuccess: () => {
      toast({
        title: editingRoleId ? "Role updated" : "Role created",
        description: editingRoleId 
          ? "The role has been updated successfully." 
          : "The role has been added successfully.",
      });
      form.reset(defaultValues);
      // In a real app, invalidate the roles query
      // queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsAddingRole(false);
      setEditingRoleId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editingRoleId ? "update" : "create"} role. ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete role mutation (disabled for mock)
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // In a real app, this would make an API call
      // For now, just simulate success
      return new Promise<void>((resolve) => {
        // Simulate API delay
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },
    onSuccess: () => {
      toast({
        title: "Role deleted",
        description: "The role has been deleted successfully.",
      });
      // In a real app, invalidate the roles query
      // queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete role. ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleAddRoleClick = () => {
    form.reset(defaultValues);
    setEditingRoleId(null);
    setIsAddingRole(true);
  };
  
  const handleEditRoleClick = (role: Role) => {
    form.reset({
      name: role.name,
      description: role.description || "",
    });
    setEditingRoleId(role.id);
    setIsAddingRole(true);
  };
  
  const handleDeleteRoleClick = (id: number) => {
    setRoleToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete);
    }
  };
  
  const onSubmit = (data: RoleFormValues) => {
    mutation.mutate(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Role Management</DialogTitle>
        </DialogHeader>
        
        {isAddingRole ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter role name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter role description" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingRole(false)}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 
                    (editingRoleId ? "Updating..." : "Creating...") : 
                    (editingRoleId ? "Update Role" : "Create Role")}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium">Manage User Roles</h4>
              <Button size="sm" onClick={handleAddRoleClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Loading roles...
                      </TableCell>
                    </TableRow>
                  ) : roles.length > 0 ? (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {role.usersCount} users
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRoleClick(role)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRoleClick(role.id)}
                            className="text-red-500"
                            disabled={role.usersCount !== undefined && role.usersCount > 0}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No roles found. Add a role to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4">
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </>
        )}
      </DialogContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the role permanently. This action cannot be undone.
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
    </Dialog>
  );
}