import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileText, Download, Edit } from "lucide-react";

interface ViewTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: number;
  onEdit: () => void;
}

export default function ViewTenderModal({
  isOpen,
  onClose,
  tenderId,
  onEdit,
}: ViewTenderModalProps) {
  // Fetch tender details
  const { data: tender, isLoading } = useQuery({
    queryKey: [`/api/tenders/${tenderId}`],
    enabled: isOpen && !!tenderId,
  });
  
  // Fetch client details for this tender
  const { data: client } = useQuery({
    queryKey: [`/api/clients/${tender?.clientId}`],
    enabled: !!tender?.clientId,
  });
  
  // Helper to format currency
  const formatCurrency = (value?: number | null) => {
    if (value == null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };
  
  // Helper for status badge
  const getStatusClass = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tender Details</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : tender ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-medium">{tender.title}</h2>
                <p className="text-sm text-muted-foreground">{tender.referenceNumber}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(tender.status)}`}>
                {tender.status?.charAt(0).toUpperCase() + tender.status?.slice(1)}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                <p>{client?.name || `Client ID: ${tender.clientId}`}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                <p>{tender.department || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Publish Date</h3>
                <p>{new Date(tender.publishDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                <p>{new Date(tender.dueDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Estimated Value</h3>
                <p>{formatCurrency(tender.estimatedValue)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                <p>{new Date(tender.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="whitespace-pre-line">{tender.description}</p>
            </div>
            
            {tender.documents && tender.documents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Documents</h3>
                <div className="space-y-2">
                  {tender.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 border border-gray-200 rounded-md"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                        <span>{doc.filename}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-2">
                          {Math.round(doc.filesize / 1024)} KB
                        </span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Tender not found</p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {tender && (
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
