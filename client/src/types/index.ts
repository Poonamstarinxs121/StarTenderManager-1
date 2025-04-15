export interface Tender {
  id: number;
  referenceNumber: string;
  title: string;
  clientId: number;
  department?: string;
  publishDate: string | Date;
  dueDate: string | Date;
  status: string;
  estimatedValue?: number;
  description: string;
  createdBy?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Client {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Document {
  id: number;
  tenderId: number;
  filename: string;
  filetype: string;
  filesize: number;
  path: string;
  uploadedBy?: number;
  uploadedAt: string | Date;
}

export interface Activity {
  id: number;
  tenderId?: number;
  activityType: string;
  description: string;
  userId: number;
  timestamp: string | Date;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}
