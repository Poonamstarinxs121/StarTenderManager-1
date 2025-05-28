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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// Lead form schema
const leadFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  companyId: z.number().min(1, 'Company is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  source: z.string().min(1, 'Source is required'),
  emdValue: z.string().default("0"),
  status: z.string().default("New"),
  tenderId: z.string().optional(),
  bidStartDate: z.string().optional(),
  bidEndDate: z.string().optional(),
  notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead?: any;
}

export default function AddLeadModal({
  isOpen,
  onClose,
  onSuccess,
  lead,
}: AddLeadModalProps) {
  const { toast } = useToast();
  
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies');
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
    enabled: isOpen
  });
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      title: '',
      companyId: 0,
      contactPerson: '',
      source: '',
      emdValue: "0",
      status: 'New',
      tenderId: '',
      bidStartDate: '',
      bidEndDate: '',
      notes: '',
    },
  });
  
  useEffect(() => {
    if (lead) {
      form.reset({
        title: lead.title,
        companyId: lead.companyId,
        contactPerson: lead.contactPerson,
        source: lead.source,
        emdValue: lead.emdValue?.toString() || "0",
        status: lead.status,
        tenderId: lead.tenderId,
        bidStartDate: lead.bidStartDate,
        bidEndDate: lead.bidEndDate,
        notes: lead.notes || '',
      });
    } else {
      form.reset({
        title: '',
        companyId: 0,
        contactPerson: '',
        source: '',
        emdValue: "0",
        status: 'New',
        tenderId: '',
        bidStartDate: '',
        bidEndDate: '',
        notes: '',
      });
    }
  }, [lead, form]);
  
  const onSubmit = async (data: LeadFormData) => {
    try {
      const url = lead ? `/api/leads/${lead.id}` : '/api/leads';
      const method = lead ? 'PUT' : 'POST';
      // Convert bidStartDate and bidEndDate to Date objects if present
      const payload = {
        ...data,
        bidStartDate: data.bidStartDate ? new Date(data.bidStartDate) : undefined,
        bidEndDate: data.bidEndDate ? new Date(data.bidEndDate) : undefined,
      };
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save lead');
      }

      toast({
        title: lead ? "Lead updated" : "Lead created",
        description: lead ? "The lead has been updated successfully." : "The lead has been created successfully.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save lead",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter lead title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company*</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company: any) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact person name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source*</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GEM">GEM</SelectItem>
                        <SelectItem value="Mp Tender">Mp Tender</SelectItem>
                        <SelectItem value="Eprocure">Eprocure</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Proposal">Proposal</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Closed Won">Closed Won</SelectItem>
                        <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emdValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EMD Value</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter EMD value" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bidEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bid End Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bidStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bid Start Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter additional notes"
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {lead ? 'Update Lead' : 'Create Lead'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}