import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from "@tanstack/react-query";

// Sample colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Reports() {
  const { data: tendersData, isLoading } = useQuery({
    queryKey: ['/api/tenders'],
  });

  // Transform data for status chart
  const getStatusData = () => {
    if (!tendersData?.tenders) return [];
    
    const statusCounts = tendersData.tenders.reduce((acc, tender) => {
      acc[tender.status] = (acc[tender.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };
  
  // Transform data for monthly chart
  const getMonthlyData = () => {
    if (!tendersData?.tenders) return [];
    
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    
    // Initialize all months with 0
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(sixMonthsAgo.getMonth() + i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      monthlyData[monthName] = 0;
    }
    
    // Count tenders by month
    tendersData.tenders.forEach(tender => {
      const date = new Date(tender.publishDate);
      if (date >= sixMonthsAgo) {
        const monthName = date.toLocaleString('default', { month: 'short' });
        if (monthlyData[monthName] !== undefined) {
          monthlyData[monthName]++;
        }
      }
    });
    
    return Object.entries(monthlyData).map(([name, count]) => ({
      name,
      count
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Reports</h2>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Status Report</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tender Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <p>Loading data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {getStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Tender Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <p>Loading data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getMonthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Tenders" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground">Total Tenders</h3>
                  <p className="text-3xl font-bold">
                    {isLoading ? "..." : tendersData?.total || 0}
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground">Open Rate</h3>
                  <p className="text-3xl font-bold">
                    {isLoading || !tendersData?.tenders ? "..." : 
                      `${((tendersData.tenders.filter(t => t.status === "open").length / tendersData.total) * 100).toFixed(1)}%`}
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground">Awarded Rate</h3>
                  <p className="text-3xl font-bold">
                    {isLoading || !tendersData?.tenders ? "..." : 
                      `${((tendersData.tenders.filter(t => t.status === "awarded").length / tendersData.total) * 100).toFixed(1)}%`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Status Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center">Loading data...</td>
                      </tr>
                    ) : getStatusData().map((status, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{status.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{status.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {((status.value / (tendersData?.total || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Tender Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Tenders" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
