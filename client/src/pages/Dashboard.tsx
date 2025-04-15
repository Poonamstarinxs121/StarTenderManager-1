import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import RecentActivity from "@/components/activity/RecentActivity";
import { AlertCircle, BarChart, Clock, Calendar, FileText, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { data: tendersData, isLoading: isLoadingTenders } = useQuery({
    queryKey: ['/api/tenders'],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-text-primary">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tenders</p>
                <h3 className="text-2xl font-bold">
                  {isLoadingTenders ? "..." : tendersData?.total || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Tenders</p>
                <h3 className="text-2xl font-bold">
                  {isLoadingTenders ? "..." : 
                   tendersData?.tenders?.filter(t => t.status === "open")?.length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Tenders</p>
                <h3 className="text-2xl font-bold">
                  {isLoadingTenders ? "..." : 
                   tendersData?.tenders?.filter(t => t.status === "pending")?.length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <BarChart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <h3 className="text-2xl font-bold">
                  {isLoadingTenders ? "..." : 
                   tendersData?.tenders?.filter(t => {
                     const date = new Date(t.publishDate);
                     const now = new Date();
                     return date.getMonth() === now.getMonth() && 
                            date.getFullYear() === now.getFullYear();
                   })?.length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Tenders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTenders ? (
              <div className="flex items-center justify-center h-40">
                <p>Loading recent tenders...</p>
              </div>
            ) : tendersData?.tenders?.length > 0 ? (
              <div className="space-y-4">
                {tendersData.tenders.slice(0, 5).map(tender => (
                  <div key={tender.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{tender.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {tender.referenceNumber}
                        </span>
                      </div>
                      <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tender.status === 'open' ? 'bg-green-100 text-green-800' : 
                        tender.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        tender.status === 'awarded' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2 flex space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(tender.publishDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Due: {new Date(tender.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tenders found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
