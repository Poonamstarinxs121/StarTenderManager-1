import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertActivity } from "@shared/schema";

/**
 * Logs a user activity to the server
 * @param activityType Type of activity being logged
 * @param description Human-readable description of the activity
 * @param userId ID of the user performing the action
 * @param tenderId Optional tender ID if the activity is related to a tender
 */
export async function logActivity(
  activityType: string,
  description: string,
  userId: number,
  tenderId?: number
): Promise<void> {
  try {
    const activityData: InsertActivity = {
      activityType,
      description,
      userId,
      tenderId
    };
    
    await apiRequest("/api/activities", "POST", activityData);
    
    // Invalidate the activity query to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['/api/activities/recent'] });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Silently fail so the application continues to work
  }
}

/**
 * Utility functions for common activity types
 */
export const ActivityLogger = {
  /**
   * Log when a user creates a new entity
   */
  logCreation: (entityType: string, entityName: string, userId: number, tenderId?: number) => {
    return logActivity(
      'create',
      `Created new ${entityType}: ${entityName}`,
      userId,
      tenderId
    );
  },
  
  /**
   * Log when a user updates an entity
   */
  logUpdate: (entityType: string, entityName: string, userId: number, tenderId?: number) => {
    return logActivity(
      'update',
      `Updated ${entityType}: ${entityName}`,
      userId,
      tenderId
    );
  },
  
  /**
   * Log when a user deletes an entity
   */
  logDeletion: (entityType: string, entityName: string, userId: number, tenderId?: number) => {
    return logActivity(
      'delete',
      `Deleted ${entityType}: ${entityName}`,
      userId,
      tenderId
    );
  },
  
  /**
   * Log when a user uploads a document
   */
  logDocumentUpload: (documentName: string, userId: number, tenderId?: number) => {
    return logActivity(
      'document',
      `Uploaded document: ${documentName}`,
      userId,
      tenderId
    );
  },
  
  /**
   * Log when a user approves something
   */
  logApproval: (entityType: string, entityName: string, userId: number, tenderId?: number) => {
    return logActivity(
      'approve',
      `Approved ${entityType}: ${entityName}`,
      userId,
      tenderId
    );
  },
  
  /**
   * Log when a user rejects something
   */
  logRejection: (entityType: string, entityName: string, userId: number, tenderId?: number) => {
    return logActivity(
      'reject',
      `Rejected ${entityType}: ${entityName}`,
      userId,
      tenderId
    );
  },
  
  /**
   * Log when a user logs in
   */
  logLogin: (username: string, userId: number) => {
    return logActivity(
      'login',
      `User logged in: ${username}`,
      userId
    );
  }
};