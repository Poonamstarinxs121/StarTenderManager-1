import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTenderSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CloudUpload, Plus, Tag, Upload } from "lucide-react";
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
  deliveryLocation: z.string().optional(),
  tenderId: z.string().optional(),
  participatingCompany: z.string().optional(),
  // Document upload fields
  documentSetLead: z.string().optional(),
  documentSetName: z.string().optional(),
  documentTags: z.string().optional(),
});

type TenderFormValues = z.infer<typeof formSchema>;

interface NewTenderProcessProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function NewTenderProcess({ onCancel, onSuccess }: NewTenderProcessProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic-details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch clients and companies for dropdowns
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });
  
  // Fetch companies
  const { data: companies } = useQuery({
    queryKey: ['/api/companies'],
  });
  
  // Create form with validation
  const form = useForm<TenderFormValues>({
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
      deliveryLocation: "",
      tenderId: "",
      participatingCompany: "",
    },
  });
  
  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['/api/users/current'],
  });
  
  // Add tender mutation
  const mutation = useMutation({
    mutationFn: async (data: TenderFormValues) => {
      const response = await apiRequest("/api/tenders", "POST", data);
      
      // Log activity
      if (currentUser && currentUser.id) {
        try {
          await apiRequest("/api/activities", "POST", {
            activityType: "create",
            description: `Created new tender: ${data.title || 'Untitled'}`,
            userId: currentUser.id,
            tenderId: response.id
          });
        } catch (error) {
          console.error("Failed to log activity:", error);
          // Don't throw - we still want the tender to be created
        }
      }
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tender created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities/recent'] }); 
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tender",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: TenderFormValues) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };
  
  // Handle tab changes
  const goToNextTab = () => {
    if (activeTab === "basic-details") {
      setActiveTab("document-upload");
    } else if (activeTab === "document-upload") {
      setActiveTab("preview-export");
    }
  };
  
  const goToPreviousTab = () => {
    if (activeTab === "document-upload") {
      setActiveTab("basic-details");
    } else if (activeTab === "preview-export") {
      setActiveTab("document-upload");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium mb-1">New Tender Process</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="basic-details">Basic Details</TabsTrigger>
          <TabsTrigger value="document-upload">Document Upload</TabsTrigger>
          <TabsTrigger value="preview-export">Preview & Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic-details">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="participatingCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Participating Company</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(companies) && companies.length > 0 ? (
                                companies.map((company: any) => (
                                  <SelectItem key={company.id} value={company.name}>
                                    {company.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-companies">No companies available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tender Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter tender name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tenderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tender ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter tender ID" {...field} />
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
                          <FormLabel>Client Name</FormLabel>
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
                              {Array.isArray(clients) && clients.length > 0 ? (
                                clients.map((client: any) => (
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
                      name="deliveryLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter delivery location" {...field} />
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
                          <FormLabel>Publish Date</FormLabel>
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
                          <FormLabel>End Date</FormLabel>
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
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={goToNextTab}>
                      Next
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="document-upload">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <FormField
                      control={form.control}
                      name="participatingCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Participating Company</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(companies) && companies.length > 0 ? (
                                companies.map((company: any) => (
                                  <SelectItem key={company.id} value={company.name}>
                                    {company.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-companies">No companies available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Document Set Details</h3>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" /> Add More Sets
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="documentSetLead"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">
                                Select Lead <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a lead" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="lead-1">Lead 1</SelectItem>
                                  <SelectItem value="lead-2">Lead 2</SelectItem>
                                  <SelectItem value="lead-3">Lead 3</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="documentSetName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">
                                Document Set Name <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter document set name" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="documentTags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Document Tags</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2 border rounded-md px-3 py-2">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <Input 
                                  placeholder="Type tag and press Enter" 
                                  className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-8 border border-gray-200 rounded-md p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium">Upload Documents</h4>
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" /> Upload Files
                        </Button>
                      </div>
                      
                      <div className="border border-dashed border-gray-300 rounded-md p-10 text-center">
                        <CloudUpload className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500 mt-4">
                          Drag and drop files here or click to browse
                        </p>
                        <Button type="button" variant="outline" size="sm" className="mt-4">
                          Browse Files
                        </Button>
                        <p className="text-xs text-gray-500 mt-4">
                          Supported formats: PDF, DOCX, XLSX, JPG, PNG (Max 10MB per file)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="button" variant="default" className="ml-auto">
                        Save Document Set
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2 mt-8">
                    <Button type="button" variant="outline" onClick={goToPreviousTab}>
                      Back
                    </Button>
                    <Button type="button" onClick={goToNextTab}>
                      Next
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview-export">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="border rounded-md p-6">
                  <h3 className="text-lg font-medium mb-4">Tender Details Preview</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Participating Company</p>
                      <p>{form.watch('participatingCompany') || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tender Name</p>
                      <p>{form.watch('title') || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tender ID</p>
                      <p>{form.watch('tenderId') || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Client</p>
                      <p>{Array.isArray(clients) && clients.find ? clients.find((c: any) => c.id === form.watch('clientId'))?.name || '-' : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Delivery Location</p>
                      <p>{form.watch('deliveryLocation') || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Publish Date</p>
                      <p>
                        {form.watch('publishDate') instanceof Date
                          ? format(form.watch('publishDate'), 'yyyy-MM-dd')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">End Date</p>
                      <p>
                        {form.watch('dueDate') instanceof Date
                          ? format(form.watch('dueDate'), 'yyyy-MM-dd')
                          : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-md font-medium mb-2">Attached Documents</h4>
                  <p className="text-sm text-gray-500">No documents attached</p>
                </div>
                
                <div className="flex justify-between gap-2">
                  <Button type="button" variant="outline" onClick={goToPreviousTab}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline">
                      Export as PDF
                    </Button>
                    <Button 
                      type="button" 
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={isSubmitting || mutation.isPending}
                    >
                      {(isSubmitting || mutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Tender
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}