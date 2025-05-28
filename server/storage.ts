import { users, clients, tenders, documents, activities, roles, companies, customers, leads } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, gte, lte, sql, count, or } from "drizzle-orm";
import type {
  User,
  InsertUser,
  Client,
  InsertClient,
  Customer,
  InsertCustomer,
  Tender,
  InsertTender,
  Document,
  InsertDocument,
  Activity,
  InsertActivity,
  Role,
  InsertRole,
  Company,
  InsertCompany,
  Lead,
  InsertLead
} from "@shared/schema";

// Storage interface for the application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Role methods
  getRole(id: number): Promise<Role | undefined>;
  getRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  getUsersCountByRoleId(roleId: number): Promise<number>;

  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  getCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;

  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomers(filters?: { status?: string, type?: string, search?: string }): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Tender methods
  getTender(id: number): Promise<Tender | undefined>;
  getTenderByReference(reference: string): Promise<Tender | undefined>;
  getTenders(filters?: {
    status?: string;
    clientId?: number;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }, page?: number, limit?: number): Promise<{ tenders: Tender[], total: number }>;
  createTender(tender: InsertTender): Promise<Tender>;
  updateTender(id: number, tender: Partial<InsertTender>): Promise<Tender | undefined>;
  deleteTender(id: number): Promise<boolean>;

  // Document methods
  getDocumentsByTenderId(tenderId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;

  // Activity methods
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Lead methods
  getLead(id: number): Promise<Lead | undefined>;
  getLeads(filters?: { status?: string, source?: string, search?: string }): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...user,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  // Role methods
  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db.insert(roles).values(role).returning();
    return newRole;
  }

  async updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined> {
    const [updatedRole] = await db
      .update(roles)
      .set(role)
      .where(eq(roles.id, id))
      .returning();
    return updatedRole;
  }

  async deleteRole(id: number): Promise<boolean> {
    await db.delete(roles).where(eq(roles.id, id));
    return true;
  }

  async getUsersCountByRoleId(roleId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.roleId, roleId));
    return Number(result.count);
  }

  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updatedCompany] = await db
      .update(companies)
      .set(company)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    await db.delete(companies).where(eq(companies.id, id));
    return true;
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomers(filters?: { status?: string, type?: string, search?: string }): Promise<Customer[]> {
    let query = db.select().from(customers);
    
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(customers.status, filters.status));
    }
    
    if (filters?.type) {
      conditions.push(eq(customers.type, filters.type));
    }
    
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(customers.name, searchTerm),
          like(customers.email, searchTerm),
          like(customers.company, searchTerm)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(customers.createdAt));
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values({
      ...customer,
      updatedAt: new Date()
    }).returning();
    
    // Add activity log
    await this.createActivity({
      tenderId: null,
      activityType: 'create',
      description: `New customer added: ${newCustomer.name}`,
      userId: 1, // Default to admin user if no user provided
    });
    
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        ...customer,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id))
      .returning();
    
    if (updatedCustomer) {
      // Add activity log
      await this.createActivity({
        tenderId: null,
        activityType: 'update',
        description: `Customer updated: ${updatedCustomer.name}`,
        userId: 1, // Default to admin user if no user provided
      });
    }
    
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    // Get customer before deleting for activity log
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    
    if (customer) {
      await db.delete(customers).where(eq(customers.id, id));
      
      // Add activity log
      await this.createActivity({
        tenderId: null,
        activityType: 'delete',
        description: `Customer deleted: ${customer.name}`,
        userId: 1, // Default to admin user if no user provided
      });
      
      return true;
    }
    
    return false;
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    await db.delete(clients).where(eq(clients.id, id));
    return true;
  }

  // Tender methods
  async getTender(id: number): Promise<Tender | undefined> {
    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id));
    return tender;
  }

  async getTenderByReference(reference: string): Promise<Tender | undefined> {
    const [tender] = await db.select().from(tenders).where(eq(tenders.referenceNumber, reference));
    return tender;
  }

  async getTenders(
    filters?: {
      status?: string;
      clientId?: number;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<{ tenders: Tender[], total: number }> {
    const offset = (page - 1) * limit;

    // Build query conditions
    let conditions = [];

    if (filters?.status) {
      conditions.push(eq(tenders.status, filters.status));
    }

    if (filters?.clientId) {
      conditions.push(eq(tenders.clientId, filters.clientId));
    }

    if (filters?.startDate) {
      conditions.push(sql`${tenders.publishDate}::timestamp >= ${filters.startDate}::timestamp`);
    }

    if (filters?.endDate) {
      conditions.push(sql`${tenders.publishDate}::timestamp <= ${filters.endDate}::timestamp`);
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        sql`(${tenders.title} ILIKE ${searchTerm} OR ${tenders.referenceNumber} ILIKE ${searchTerm})`
      );
    }

    // Create the where clause
    const whereClause = conditions.length > 0 
      ? and(...conditions)
      : undefined;

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenders)
      .where(whereClause || sql`TRUE`);

    // Get tenders with pagination
    const result = await db
      .select()
      .from(tenders)
      .where(whereClause || sql`TRUE`)
      .orderBy(desc(tenders.createdAt))
      .limit(limit)
      .offset(offset);

    return { 
      tenders: result,
      total: Number(count)
    };
  }

  async createTender(tender: InsertTender): Promise<Tender> {
    const [newTender] = await db.insert(tenders).values(tender).returning();

    // Add activity log
    await this.createActivity({
      tenderId: newTender.id,
      activityType: 'create',
      description: `New tender added: ${newTender.title}`,
      userId: newTender.createdBy || 1,
    });

    return newTender;
  }

  async updateTender(id: number, tender: Partial<InsertTender>): Promise<Tender | undefined> {
    const [updatedTender] = await db
      .update(tenders)
      .set({
        ...tender,
        updatedAt: new Date(),
      })
      .where(eq(tenders.id, id))
      .returning();

    if (updatedTender) {
      // Add activity log
      await this.createActivity({
        tenderId: updatedTender.id,
        activityType: 'update',
        description: `Tender updated: ${updatedTender.title}`,
        userId: tender.createdBy || 1,
      });
    }

    return updatedTender;
  }

  async deleteTender(id: number): Promise<boolean> {
    // Get tender before deleting for activity log
    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id));

    if (tender) {
      // Delete associated documents first
      await db.delete(documents).where(eq(documents.tenderId, id));

      // Delete the tender
      await db.delete(tenders).where(eq(tenders.id, id));

      // Add activity log
      await this.createActivity({
        tenderId: null,
        activityType: 'delete',
        description: `Tender deleted: ${tender.title} (${tender.referenceNumber})`,
        userId: tender.createdBy || 1,
      });

      return true;
    }

    return false;
  }

  // Document methods
  async getDocumentsByTenderId(tenderId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.tenderId, tenderId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    await db.delete(documents).where(eq(documents.id, id));
    return true;
  }

  // Activity methods
  async getRecentActivities(limit: number = 5): Promise<any[]> {
    return await db
      .select({
        id: activities.id,
        tenderId: activities.tenderId,
        activityType: activities.activityType,
        description: activities.description,
        userId: activities.userId,
        timestamp: activities.timestamp,
        userName: users.name,
      })
      .from(activities)
      .leftJoin(users, eq(activities.userId, users.id))
      .orderBy(desc(activities.timestamp))
      .limit(limit);
  }
  
  async getActivitiesByUser(userId: number, limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.timestamp))
      .limit(limit);
  }
  
  async getActivitiesByTender(tenderId: number, limit: number = 20): Promise<any[]> {
    return await db
      .select({
        id: activities.id,
        tenderId: activities.tenderId,
        activityType: activities.activityType,
        description: activities.description,
        userId: activities.userId,
        timestamp: activities.timestamp,
        userName: users.name,
      })
      .from(activities)
      .leftJoin(users, eq(activities.userId, users.id))
      .where(eq(activities.tenderId, tenderId))
      .orderBy(desc(activities.timestamp))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // Lead methods
  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db
      .select({
        id: leads.id,
        title: leads.title,
        companyId: leads.companyId,
        contactPerson: leads.contactPerson,
        source: leads.source,
        emdValue: leads.emdValue,
        status: leads.status,
        assignedTo: leads.assignedTo,
        tenderId: leads.tenderId,
        bidStartDate: leads.bidStartDate,
        bidEndDate: leads.bidEndDate,
        notes: leads.notes,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        companyName: companies.name,
      })
      .from(leads)
      .leftJoin(companies, eq(leads.companyId, companies.id))
      .where(eq(leads.id, id));
    return lead;
  }

  async getLeads(filters?: { status?: string, source?: string, search?: string }): Promise<Lead[]> {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(leads.status, filters.status));
    }
    
    if (filters?.source) {
      conditions.push(eq(leads.source, filters.source));
    }
    
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(leads.title, searchTerm),
          like(companies.name, searchTerm),
          like(leads.contactPerson, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const results = await db
      .select({
        id: leads.id,
        title: leads.title,
        companyId: leads.companyId,
        contactPerson: leads.contactPerson,
        source: leads.source,
        emdValue: leads.emdValue,
        status: leads.status,
        assignedTo: leads.assignedTo,
        tenderId: leads.tenderId,
        bidStartDate: leads.bidStartDate,
        bidEndDate: leads.bidEndDate,
        notes: leads.notes,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        companyName: companies.name,
      })
      .from(leads)
      .leftJoin(companies, eq(leads.companyId, companies.id))
      .where(whereClause || sql`TRUE`)
      .orderBy(desc(leads.createdAt));

    return results;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    // Ensure required fields are present and properly formatted
    const leadData = {
      ...lead,
      emdValue: lead.emdValue || "0",
      status: lead.status || "New",
      updatedAt: new Date(),
      // Ensure dates are in the correct format (bid dates are handled by Zod coerce)
      bidStartDate: lead.bidStartDate,
      bidEndDate: lead.bidEndDate
    };

    try {
      const [newLead] = await db.insert(leads).values(leadData).returning();

      // Add activity log
      await this.createActivity({
        tenderId: null,
        activityType: 'CREATE_LEAD',
        description: `New lead created: ${newLead.title}`,
        userId: newLead.assignedTo || 1, // Use assigned user or default to admin
      });

      // Fetch the complete lead with company information
      const createdLead = await this.getLead(newLead.id);
      if (!createdLead) {
        throw new Error('Failed to fetch created lead');
      }
      return createdLead;
    } catch (error) {
      console.error('Error creating lead:', error);
      // Re-throw a generic error for security, or pass a more specific one if safe
      throw new Error('Failed to create lead.');
    }
  }

  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updatedLead] = await db
      .update(leads)
      .set({
        ...lead,
        updatedAt: new Date()
      })
      .where(eq(leads.id, id))
      .returning();
    
    if (updatedLead) {
      // Add activity log
      await this.createActivity({
        tenderId: null,
        activityType: 'UPDATE_LEAD',
        description: `Lead updated: ${updatedLead.title}`,
        userId: lead.assignedTo || 1, // Use assigned user or default to admin
      });
      
      // Fetch the complete lead with company information
      return await this.getLead(id);
    }
    
    return undefined;
  }

  async deleteLead(id: number): Promise<boolean> {
    // Get lead before deleting for activity log
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    
    if (lead) {
      await db.delete(leads).where(eq(leads.id, id));
      
      // Add activity log
      await this.createActivity({
        tenderId: null,
        activityType: 'DELETE_LEAD',
        description: `Lead deleted: ${lead.title}`,
        userId: lead.assignedTo || 1, // Use assigned user or default to admin
      });
      
      return true;
    }
    
    return false;
  }
}

export const storage = new DatabaseStorage();