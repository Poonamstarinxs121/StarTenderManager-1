import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  Download, 
  Eye, 
  File, 
  FileText, 
  FileIcon, 
  Image,
  FileSpreadsheet,
  MoreVertical 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

// This would be replaced with real API types
interface Document {
  id: number;
  filename: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadDate: string;
  tenderId?: number;
  tenderName?: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function DocumentManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data - would be replaced with API call
  const documents: Document[] = [
    {
      id: 1,
      filename: "Tender_Requirements_2023.pdf",
      type: "pdf",
      size: 2560000,
      uploadedBy: "John Smith",
      uploadDate: "2023-12-01",
      tenderId: 101,
      tenderName: "City Infrastructure Project",
      status: "Approved"
    },
    {
      id: 2,
      filename: "Technical_Specifications.docx",
      type: "docx",
      size: 1840000,
      uploadedBy: "Sarah Johnson",
      uploadDate: "2023-11-28",
      tenderId: 101,
      tenderName: "City Infrastructure Project",
      status: "Approved"
    },
    {
      id: 3,
      filename: "Budget_Estimation.xlsx",
      type: "xlsx",
      size: 950000,
      uploadedBy: "Michael Brown",
      uploadDate: "2023-11-25",
      tenderId: 102,
      tenderName: "Hospital Renovation",
      status: "Pending"
    },
    {
      id: 4,
      filename: "Site_Photos.jpg",
      type: "jpg",
      size: 3800000,
      uploadedBy: "Emily Davis",
      uploadDate: "2023-11-22",
      tenderId: 102,
      tenderName: "Hospital Renovation",
      status: "Approved"
    },
    {
      id: 5,
      filename: "Legal_Agreements.pdf",
      type: "pdf",
      size: 4200000,
      uploadedBy: "Robert Wilson",
      uploadDate: "2023-11-20",
      tenderId: 103,
      tenderName: "School Construction",
      status: "Rejected"
    }
  ];
  
  const filteredDocuments = documents.filter((doc) => 
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tenderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getFileIcon = (type: string) => {
    switch(type) {
      case "pdf": return <FileIcon className="h-8 w-8 text-red-500" />;
      case "docx": return <FileText className="h-8 w-8 text-blue-500" />;
      case "xlsx": return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      case "jpg": 
      case "png": 
      case "gif": return <Image className="h-8 w-8 text-purple-500" />;
      default: return <File className="h-8 w-8 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: Document["status"]) => {
    switch(status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Document Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle>Document Library</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Related Tender</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getFileIcon(doc.type)}
                          <div className="font-medium">{doc.filename}</div>
                        </div>
                      </TableCell>
                      <TableCell>{doc.tenderName || "N/A"}</TableCell>
                      <TableCell>{doc.uploadedBy}</TableCell>
                      <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
                      <TableCell>{formatFileSize(doc.size)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Document
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-green-600">
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDocuments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No documents found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle>Pending Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Similar table content but filtered for pending docs */}
              <p className="py-4">Showing documents with Pending status.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle>Approved Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Similar table content but filtered for approved docs */}
              <p className="py-4">Showing documents with Approved status.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle>Rejected Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Similar table content but filtered for rejected docs */}
              <p className="py-4">Showing documents with Rejected status.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <h3 className="text-2xl font-bold mt-1">{documents.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <File className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <h3 className="text-2xl font-bold mt-1">
                  {documents.filter(d => d.status === "Pending").length}
                </h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
                </h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FileSpreadsheet className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}