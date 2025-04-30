import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTenderSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CloudUpload } from "lucide-react";
import { format } from "date-fns";

// Extend the schema with validation
const formSchema = insertTenderSchema.extend({
  dueDate: z.coerce.date().refine(
    (date) => {
      if (!date) return false;
      return date > new Date();
    },
    { message: "Due date must be in the future" }
  ),
  publishDate: z.coerce.date(),
  estimatedValue: z.coerce.number().optional(),
});

interface AddTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editId?: number | null;
  onSuccess: () => void;
}

export default function AddTenderModal({ 
  isOpen, 
  onClose, 
  editId = null,
  onSuccess 
}: AddTenderModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch clients for dropdown
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });
  
  // Fetch tender data if in edit mode
  const { data: tenderData, isLoading: isLoadingTender } = useQuery({
    queryKey: ['/api/tenders', editId],
    enabled: !!editId,
  });
  
  // Create form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      referenceNumber: "",
      clientId: undefined,
      department: "",
      publishDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "open",
      estimatedValue: undefined,
      description: "",
      createdBy: 1, // Default to first user for now
    },
  });
  
  // Update form values when editing
  useEffect(() => {
    if (tenderData && editId) {
      // We need to format the dates properly
      const formattedData = {
        ...tenderData,
        publishDate: new Date(tenderData.publishDate),
        dueDate: new Date(tenderData.dueDate),
        clientId: tenderData.clientId
      };
      
      form.reset(formattedData);
    }
  }, [tenderData, editId, form]);
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (editId) {
        // Update existing tender
        await apiRequest("PUT", `/api/tenders/${editId}`, data);
        toast({
          title: "Success",
          description: "Tender updated successfully",
        });
      } else {
        // Create new tender
        await apiRequest("POST", "/api/tenders", data);
        toast({
          title: "Success",
          description: "Tender created successfully",
        });
      }
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save tender",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editId ? "Edit Tender" : "Add New Tender"}
          </DialogTitle>
        </DialogHeader>
        
        {isLoadingTender && editId ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tender Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tender title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. TN-2023-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client*</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients && clients.length > 0 ? (
                            clients.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-clients">No clients available</SelectItem>
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
                      <FormControl>
                        <Input placeholder="Department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publishDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Date*</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          value={field.value instanceof Date 
                            ? format(field.value, 'yyyy-MM-dd')
                            : ''
                          }
                          onChange={(e) => {
                            field.onChange(e.target.value ? new Date(e.target.value) : null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date*</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          value={field.value instanceof Date 
                            ? format(field.value, 'yyyy-MM-dd')
                            : ''
                          }
                          onChange={(e) => {
                            field.onChange(e.target.value ? new Date(e.target.value) : null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="awarded">Awarded</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estimatedValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Value (INR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter detailed description of the tender"
                        className="h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                <CloudUpload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">
                  Drag and drop files here or click to browse
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-2">
                  Browse Files
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, DOCX, XLSX, JPG, PNG (Max 10MB per file)
                </p>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editId ? "Update Tender" : "Save Tender"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
