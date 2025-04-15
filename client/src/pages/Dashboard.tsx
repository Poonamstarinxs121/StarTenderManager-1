import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import RecentActivity from "@/components/activity/RecentActivity";
import { FileText, Target, FileSpreadsheet, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: tendersData, isLoading: isLoadingTenders } = useQuery({
    queryKey: ['/api/tenders'],
  });

  const { data: leadsData } = useQuery({
    queryKey: ['/api/leads'],
    enabled: false, // Disabled until we have the API endpoint
  });

  const { data: documentsData } = useQuery({
    queryKey: ['/api/documents'],
    enabled: false, // Disabled until we have the API endpoint
  });

  const { data: projectsData } = useQuery({
    queryKey: ['/api/projects'],
    enabled: false, // Disabled until we have the API endpoint
  });

  // Count values - will be replaced with real data when APIs are implemented
  const activeProjects = projectsData?.length || 0;
  const pendingLeads = leadsData?.length || 0;
  const openTenders = tendersData?.tenders?.filter(t => t.status === "open")?.length || 0;
  const pendingDocuments = documentsData?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileCheck className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button variant="outline">
            Filter View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <Card className="border rounded-md shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Active Projects</h3>
                <div className="bg-blue-100 p-2 rounded-md">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-3xl font-bold mb-4">{activeProjects}</p>
                <Link href="/projects">
                  <a className="text-sm text-blue-600 hover:underline">View Projects</a>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Leads */}
        <Card className="border rounded-md shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Pending Leads</h3>
                <div className="bg-yellow-100 p-2 rounded-md">
                  <Target className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-3xl font-bold mb-4">{pendingLeads}</p>
                <Link href="/leads">
                  <a className="text-sm text-blue-600 hover:underline">View Leads</a>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open Tenders */}
        <Card className="border rounded-md shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Open Tenders</h3>
                <div className="bg-green-100 p-2 rounded-md">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-3xl font-bold mb-4">{openTenders}</p>
                <Link href="/tender-management">
                  <a className="text-sm text-blue-600 hover:underline">View Tenders</a>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Pending */}
        <Card className="border rounded-md shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Documents Pending</h3>
                <div className="bg-red-100 p-2 rounded-md">
                  <FileSpreadsheet className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-3xl font-bold mb-4">{pendingDocuments}</p>
                <Link href="/document-management">
                  <a className="text-sm text-blue-600 hover:underline">View Documents</a>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* This section will be populated with charts and recent activity data when available */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTenders ? (
              <div className="flex items-center justify-center h-40">
                <p>Loading...</p>
              </div>
            ) : tendersData?.tenders?.length > 0 ? (
              <div className="space-y-4">
                {tendersData.tenders.slice(0, 5).map(tender => (
                  <div key={tender.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div>
                      <h4 className="font-medium">{tender.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tender.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tender.status === 'open' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tender.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming deadlines</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
