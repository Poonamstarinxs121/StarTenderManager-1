import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// User form schema (password optional for editing)
const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
  role: z.string().min(1, { message: "Please select a role." }),
  department: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editId?: number | null;
  onSuccess: () => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  editId,
  onSuccess,
}: AddUserModalProps) {
  const { toast } = useToast();
  const isEditing = !!editId;
  
  // Fetch roles from backend
  const { data: roles = [] } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      const res = await fetch('/api/roles');
      if (!res.ok) throw new Error('Failed to fetch roles');
      return res.json();
    },
  });
  
  // Default values for the form
  const defaultValues: UserFormValues = {
    name: "",
    username: "",
    email: "",
    password: "",
    role: "",
    department: "",
  };
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });
  
  // Fetch user data when editing
  useEffect(() => {
    if (isEditing && editId) {
      fetch(`/api/users`)
        .then((res) => res.json())
        .then((users) => {
          const user = users.find((u: any) => u.id === editId);
          if (user) {
            form.reset({
              name: user.name || "",
              username: user.username || "",
              email: user.email || "",
              password: "", // Don't prefill password
              role: user.role || "user",
              department: user.department || "",
            });
          }
        });
    } else {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, editId]);
  
  // Add/edit user mutation
  const mutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      // Remove password if editing and not provided
      if (isEditing && !data.password) {
        const { password, ...rest } = data;
        return apiRequest(`/api/users/${editId}`, "PATCH", rest);
      }
      if (isEditing) {
        return apiRequest(`/api/users/${editId}`, "PATCH", data);
      } else {
        return apiRequest("/api/users", "POST", data);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "User updated" : "User created",
        description: isEditing 
          ? "The user has been updated successfully." 
          : "The user has been added successfully.",
      });
      form.reset(defaultValues);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} user. ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: UserFormValues) => {
    console.log("Submitting", data);
    mutation.mutate(data);
  };
  
  console.log("Form errors:", form.formState.errors);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password*</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.length === 0 ? (
                          <SelectItem value="" disabled>No roles found</SelectItem>
                        ) : (
                          roles.map((role: any) => (
                            <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 
                  (isEditing ? "Updating..." : "Creating...") : 
                  (isEditing ? "Update" : "Create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}