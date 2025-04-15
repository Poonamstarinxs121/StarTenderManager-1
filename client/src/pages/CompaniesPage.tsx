import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Search, Plus, Download } from "lucide-react";

// This would be replaced with real API types
interface Company {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  status: string;
}

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data - would be replaced with API call
  const companies: Company[] = [
    {
      id: 1,
      name: "Tech Solutions Inc.",
      contactPerson: "John Smith",
      email: "john.smith@techsolutions.com",
      phone: "+1 123-456-7890",
      location: "New York, USA",
      status: "Active"
    },
    {
      id: 2,
      name: "Global Innovations Ltd.",
      contactPerson: "Emma Johnson",
      email: "emma.j@globalinnovations.co.uk",
      phone: "+44 20 1234 5678",
      location: "London, UK",
      status: "Active"
    },
    {
      id: 3,
      name: "Pacific Systems",
      contactPerson: "Robert Chen",
      email: "robert@pacificsystems.com",
      phone: "+1 987-654-3210",
      location: "San Francisco, USA",
      status: "Inactive"
    }
  ];
  
  const filteredCompanies = companies.filter((company) => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Companies</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Company List</CardTitle>
          <div className="flex items-center mt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search companies..."
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
                <TableHead>Company Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.contactPerson}</TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>{company.phone}</TableCell>
                  <TableCell>{company.location}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      company.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {company.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No companies found. Try adjusting your search.
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