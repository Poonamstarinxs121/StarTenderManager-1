import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ActivityLogger } from "@/utils/activity-logger";

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

// Company form schema
const companyFormSchema = z.object({
  name: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  cin: z.string().optional(),  // CIN field (Corporate Identity Number)
  pan: z.string().optional(),  // PAN field (Permanent Account Number)
  gst: z.string().optional(),  // GST field (Goods and Services Tax Number)
  contactPerson: z.string().min(2, { message: "Contact person must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(6, { message: "Please enter a valid phone number." }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
  pincode: z.string().optional(),  // PIN code / Postal code
  status: z.string().min(1, { message: "Please select a status." }),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  editId?: number | null;
  onSuccess: () => void;
}

export default function AddCompanyModal({
  isOpen,
  onClose,
  editId,
  onSuccess,
}: AddCompanyModalProps) {
  const { toast } = useToast();
  const isEditing = !!editId;
  
  // Default values for the form
  const defaultValues: CompanyFormValues = {
    name: "",
    cin: "",
    pan: "",
    gst: "",
    contactPerson: "",
    email: "",
    phone: "",
    location: "",
    pincode: "",
    status: "Active",
  };
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues,
  });
  
  // Get current user for activity logging
  const { data: currentUser } = useQuery({
    queryKey: ['/api/users/current'],
  });

  // Add/edit company mutation
  const mutation = useMutation({
    mutationFn: async (data: CompanyFormValues) => {
      let response;
      
      if (isEditing) {
        response = await apiRequest(`/api/companies/${editId}`, "PATCH", data);
        
        // Log activity for company update
        if (currentUser?.id) {
          ActivityLogger.logUpdate('company', data.name, currentUser.id);
        }
      } else {
        response = await apiRequest("/api/companies", "POST", data);
        
        // Log activity for company creation
        if (currentUser?.id) {
          ActivityLogger.logCreation('company', data.name, currentUser.id);
        }
      }
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Company updated" : "Company created",
        description: isEditing 
          ? "The company has been updated successfully." 
          : "The company has been added successfully.",
      });
      form.reset(defaultValues);
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities/recent'] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} company. ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: CompanyFormValues) => {
    mutation.mutate(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Company" : "Add New Company"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Company Registration Details */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CIN</FormLabel>
                    <FormControl>
                      <Input placeholder="Corporate Identity Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN</FormLabel>
                    <FormControl>
                      <Input placeholder="Permanent Account Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST</FormLabel>
                    <FormControl>
                      <Input placeholder="GST Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact person" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="example@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone*</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (234) 567-8901" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location*</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal / ZIP Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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