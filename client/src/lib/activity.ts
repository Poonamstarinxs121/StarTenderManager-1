import { apiRequest } from "./queryClient";

/**
 * Log user activity in the system
 * @param activityType Type of activity being performed (e.g., 'CREATE_TENDER', 'UPDATE_COMPANY')
 * @param description Human-readable description of the activity
 * @param userId ID of the user performing the action
 * @param tenderId Optional tender ID if the activity is related to a tender
 * @returns Promise with the created activity
 */
export async function logActivity(
  activityType: string,
  description: string,
  userId: number = 1, // Default to first user for now
  tenderId?: number
): Promise<any> {
  try {
    const activityData = {
      activityType,
      description,
      userId,
      ...(tenderId && { tenderId }),
    };
    
    return await apiRequest("/api/activities", "POST", activityData);
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - we don't want to break app functionality if logging fails
    return null;
  }
}

// Common activity types
export const ActivityTypes = {
  // Tender related
  CREATE_TENDER: "CREATE_TENDER",
  UPDATE_TENDER: "UPDATE_TENDER",
  DELETE_TENDER: "DELETE_TENDER",
  UPLOAD_DOCUMENT: "UPLOAD_DOCUMENT",
  
  // Company related
  CREATE_COMPANY: "CREATE_COMPANY",
  UPDATE_COMPANY: "UPDATE_COMPANY",
  DELETE_COMPANY: "DELETE_COMPANY",
  
  // Client related
  CREATE_CLIENT: "CREATE_CLIENT",
  UPDATE_CLIENT: "UPDATE_CLIENT",
  DELETE_CLIENT: "DELETE_CLIENT",
  
  // User related
  CREATE_USER: "CREATE_USER", 
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  USER_LOGIN: "USER_LOGIN",
  
  // Role related
  CREATE_ROLE: "CREATE_ROLE",
  UPDATE_ROLE: "UPDATE_ROLE",
  DELETE_ROLE: "DELETE_ROLE",
  
  // OEM related
  CREATE_OEM: "CREATE_OEM",
  UPDATE_OEM: "UPDATE_OEM",
  DELETE_OEM: "DELETE_OEM",
  
  // Customer related
  CREATE_CUSTOMER: "CREATE_CUSTOMER",
  UPDATE_CUSTOMER: "UPDATE_CUSTOMER",
  DELETE_CUSTOMER: "DELETE_CUSTOMER",
  
  // Lead related
  CREATE_LEAD: "CREATE_LEAD",
  UPDATE_LEAD: "UPDATE_LEAD",
  DELETE_LEAD: "DELETE_LEAD",
};