import { users, clients, tenders, documents, activities, roles, companies } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, gte, lte, sql, count } from "drizzle-orm";
import type {
  User,
  InsertUser,
  Client,
  InsertClient,
  Tender,
  InsertTender,
  Document,
  InsertDocument,
  Activity,
  InsertActivity,
  Role,
  InsertRole,
  Company,
  InsertCompany
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
  async getRecentActivities(limit: number = 5): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }
}

export const storage = new DatabaseStorage();