import { pgTable, text, serial, integer, boolean, date, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  tenders: many(tenders),
}));

export const tenders = pgTable("tenders", {
  id: serial("id").primaryKey(),
  referenceNumber: varchar("reference_number", { length: 20 }).notNull().unique(),
  title: text("title").notNull(),
  clientId: integer("client_id").references(() => clients.id),
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
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true });
export const insertTenderSchema = createInsertSchema(tenders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, uploadedAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, timestamp: true });

// Select types
export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Tender = typeof tenders.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Activity = typeof activities.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertTender = z.infer<typeof insertTenderSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
