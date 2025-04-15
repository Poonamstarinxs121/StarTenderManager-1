import { useState } from "react";
import { Tender } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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

interface TenderTableProps {
  tenders: Tender[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewTender: (id: number) => void;
  onEditTender: (id: number) => void;
  onRefresh: () => void;
}

export default function TenderTable({
  tenders,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onViewTender,
  onEditTender,
  onRefresh
}: TenderTableProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenderToDelete, setTenderToDelete] = useState<Tender | null>(null);
  
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  const end = Math.min(start + limit - 1, total);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const sortedTenders = [...tenders].sort((a, b) => {
    if (!sortField) return 0;
    
    const fieldA = (a as any)[sortField];
    const fieldB = (b as any)[sortField];
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  const handleDeleteClick = (tender: Tender) => {
    setTenderToDelete(tender);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!tenderToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/tenders/${tenderToDelete.id}`, null);
      
      toast({
        title: "Tender deleted",
        description: `Tender ${tenderToDelete.referenceNumber} has been deleted successfully.`,
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tender. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTenderToDelete(null);
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'closed':
        return 'bg-gray-200 text-gray-800';
      case 'awarded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Tender Listings</h3>
          <div className="flex items-center">
            <span className="text-sm text-text-secondary mr-2">Show:</span>
            <Select 
              value={limit.toString()} 
              onValueChange={(value) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder={limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('referenceNumber')}>
                    Tender ID
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('title')}>
                    Title
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('clientId')}>
                    Client
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('publishDate')}>
                    Publish Date
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('dueDate')}>
                    Due Date
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                    Status
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">Loading tenders...</td>
                </tr>
              ) : sortedTenders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">No tenders found</td>
                </tr>
              ) : (
                sortedTenders.map((tender) => (
                  <tr key={tender.id} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">{tender.referenceNumber}</span>
                    </td>
                    <td className="py-3 px-4">{tender.title}</td>
                    <td className="py-3 px-4">{tender.clientId}</td>
                    <td className="py-3 px-4">
                      {new Date(tender.publishDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(tender.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(tender.status)}`}>
                        {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => onViewTender(tender.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEditTender(tender.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(tender)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-text-secondary">
            {total > 0 ? (
              <>Showing <span>{start}</span> to <span>{end}</span> of <span>{total}</span> entries</>
            ) : (
              <>No entries found</>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPageChange(page - 1)} 
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around the current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPageChange(page + 1)} 
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete tender {tenderToDelete?.referenceNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
