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
  AlertCircle,
  Pencil,
  Trash2
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
  companyId: number;
  company: {
    id: number;
    name: string;
  };
  contactPerson: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  value: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function LeadsPage() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const { data: leads = [], refetch } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      return response.json();
    }
  });

  const filteredLeads = leads.filter((lead: Lead) => {
    const matchesSearch = 
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete lead');
      
      refetch();
    } catch (error) {
      console.error('Error deleting lead:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleSuccess = () => {
    setEditingLead(null);
    refetch();
  };

  const totalValue = filteredLeads.reduce((sum: number, lead: Lead) => sum + lead.value, 0);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          Add New Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {filteredLeads.filter((l: Lead) => l.status === 'New').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Qualified Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {filteredLeads.filter((l: Lead) => l.status === 'Qualified').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₹{totalValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Closed Won">Closed Won</SelectItem>
                <SelectItem value="Closed Lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sourceFilter}
              onValueChange={setSourceFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead: Lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.title}</TableCell>
                    <TableCell>{lead.company.name}</TableCell>
                    <TableCell>
                      <div>
                        <p>{lead.contactPerson}</p>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                        <p className="text-sm text-gray-500">{lead.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        lead.status === 'New' ? 'default' :
                        lead.status === 'Qualified' ? 'secondary' :
                        lead.status === 'Proposal' ? 'outline' :
                        lead.status === 'Negotiation' ? 'destructive' :
                        lead.status === 'Closed Won' ? 'secondary' :
                        'destructive'
                      }>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{lead.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(lead)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingLead(null);
        }}
        onSuccess={handleSuccess}
        lead={editingLead}
      />
    </div>
  );
}