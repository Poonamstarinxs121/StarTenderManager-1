import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Search, Plus, Download, FileText, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// This would be replaced with real API types
interface OEM {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  status: string;
}

export default function OEMsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data - would be replaced with API call
  const oems: OEM[] = [
    {
      id: 1,
      name: "Electronic Innovations",
      contactPerson: "Sarah Miller",
      email: "sarah@electronicinnovations.com",
      phone: "+1 555-123-4567",
      category: "Electronics",
      status: "Active"
    },
    {
      id: 2,
      name: "Advanced Machinery",
      contactPerson: "Michael Brown",
      email: "michael@advancedmachinery.com",
      phone: "+1 555-987-6543",
      category: "Machinery",
      status: "Active"
    },
    {
      id: 3,
      name: "GreenTech Solutions",
      contactPerson: "Linda Garcia",
      email: "linda@greentechsolutions.com",
      phone: "+1 555-444-3333",
      category: "Renewable Energy",
      status: "Inactive"
    }
  ];
  
  const filteredOEMs = oems.filter((oem) => 
    oem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    oem.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    oem.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Original Equipment Manufacturers (OEMs)</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add OEM
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>OEM List</CardTitle>
          <div className="flex items-center mt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search OEMs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OEM Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOEMs.map((oem) => (
                <TableRow key={oem.id}>
                  <TableCell className="font-medium">{oem.name}</TableCell>
                  <TableCell>{oem.contactPerson}</TableCell>
                  <TableCell>{oem.email}</TableCell>
                  <TableCell>{oem.phone}</TableCell>
                  <TableCell>{oem.category}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      oem.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {oem.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOEMs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No OEMs found. Try adjusting your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}