import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@shared/schema";
import { 
  Clock, 
  FileText, 
  User, 
  Plus, 
  Edit, 
  Trash, 
  Activity as ActivityIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

export default function RecentActivity() {
  const isMobile = useIsMobile();
  
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activities/recent'],
  });

  function getActivityIcon(activityType: string) {
    switch (activityType) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <Trash className="h-4 w-4 text-red-500" />;
      case 'login':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'reject':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-500" />;
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <ActivityIcon className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`${isMobile ? 'h-[250px]' : 'h-[350px]'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Loading activities...</p>
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity: Activity & { userName?: string }) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.activityType)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        {activity.timestamp instanceof Date 
                          ? format(activity.timestamp, 'MMM d, yyyy h:mm a')
                          : activity.timestamp 
                            ? format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a') 
                            : 'Unknown date'}
                      </span>
                      <span className="mx-1">•</span>
                      <User className="mr-1 h-3 w-3" />
                      <span>{activity.userName || 'User'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No recent activities</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}