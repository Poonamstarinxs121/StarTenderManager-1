import { pgTable, text, serial, integer, boolean, date, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role").notNull().default("user"),
  roleId: integer("role_id").references(() => roles.id),
  department: text("department"),
  status: text("status").default("active"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
  userRole: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cin: text("cin"),  // Corporate Identity Number
  pan: text("pan"),  // Permanent Account Number
  gst: text("gst"),  // Goods and Services Tax Number
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  location: text("location"),
  pincode: text("pincode"),  // PIN code / Postal code
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  tenders: many(tenders),
}));

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  type: text("type"), // Regular, VIP, etc.
  source: text("source"), // Where the customer came from
  status: text("status").default("active"),
  lastContact: timestamp("last_contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  tenders: many(tenders),
}));

export const customersRelations = relations(customers, ({}) => ({}));

export const tenders = pgTable("tenders", {
  id: serial("id").primaryKey(),
  referenceNumber: varchar("reference_number", { length: 20 }).notNull().unique(),
  title: text("title").notNull(),
  clientId: integer("client_id").references(() => clients.id),
  companyId: integer("company_id").references(() => companies.id),
  department: text("department"),
  publishDate: date("publish_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: text("status").notNull().default("open"),
  estimatedValue: numeric("estimated_value"),
  description: text("description").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tendersRelations = relations(tenders, ({ one }) => ({
  client: one(clients, {
    fields: [tenders.clientId],
    references: [clients.id],
  }),
  company: one(companies, {
    fields: [tenders.companyId],
    references: [companies.id],
  }),
  creator: one(users, {
    fields: [tenders.createdBy],
    references: [users.id],
  }),
}));

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").references(() => tenders.id).notNull(),
  filename: text("filename").notNull(),
  filesize: integer("filesize").notNull(),
  filetype: text("filetype").notNull(),
  path: text("path").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  tender: one(tenders, {
    fields: [documents.tenderId],
    references: [tenders.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  contactPerson: text("contact_person").notNull(),
  source: text("source").notNull(),
  emdValue: numeric("emd_value").notNull().default("0"),
  status: text("status").notNull().default("New"),
  assignedTo: integer("assigned_to").references(() => users.id),
  tenderId: text("tender_id"),
  bidStartDate: timestamp("bid_start_date"),
  bidEndDate: timestamp("bid_end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leadsRelations = relations(leads, ({ one }) => ({
  assignee: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
}));

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").references(() => tenders.id),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  tender: one(tenders, {
    fields: [activities.tenderId],
    references: [tenders.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, lastLogin: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTenderSchema = createInsertSchema(tenders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, uploadedAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, timestamp: true });
export const insertLeadSchema = z.object({
  title: z.string().min(1),
  companyId: z.number().min(1),
  contactPerson: z.string().min(1),
  source: z.string().min(1),
  emdValue: z.string().default("0"),
  status: z.string().default("New"),
  tenderId: z.string().optional(),
  bidStartDate: z.coerce.date().optional(),
  bidEndDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  assignedTo: z.number().optional(),
});

// Select types
export type User = typeof users.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Tender = typeof tenders.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Lead = typeof leads.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertTender = z.infer<typeof insertTenderSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
