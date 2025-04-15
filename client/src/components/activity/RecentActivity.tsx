import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Edit, 
  CheckCircle, 
  Clock, 
  Loader2,
  AlertCircle
} from "lucide-react";

export default function RecentActivity() {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['/api/activities/recent'],
  });
  
  // Helper to get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'update':
        return <Edit className="h-5 w-5 text-secondary" />;
      case 'delete':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'status_change':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'due_date_change':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };
  
  // Helper to get background for activity type
  const getActivityBackground = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-primary/10';
      case 'update':
        return 'bg-secondary/10';
      case 'delete':
        return 'bg-destructive/10';
      case 'status_change':
        return 'bg-success/10';
      case 'due_date_change':
        return 'bg-warning/10';
      default:
        return 'bg-primary/10';
    }
  };
  
  // Helper to format date
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-6 text-destructive">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load recent activities</p>
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start pb-3 border-b border-gray-200 last:border-b-0 last:pb-0">
                <div className={`rounded-full ${getActivityBackground(activity.activityType)} p-2 mr-3`}>
                  {getActivityIcon(activity.activityType)}
                </div>
                <div>
                  <div className="text-sm font-medium">{activity.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)} - by {activity.userId}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No recent activities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
