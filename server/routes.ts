import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTenderSchema, 
  insertClientSchema, 
  insertDocumentSchema, 
  insertActivitySchema,
  insertRoleSchema,
  insertCompanySchema,
  insertCustomerSchema,
  insertLeadSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to validate request body against a schema
  const validateBody = <T extends z.ZodTypeAny>(schema: T) => {
    return async (req: Request, res: Response, next: Function) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (err) {
        if (err instanceof z.ZodError) {
          const validationError = fromZodError(err);
          return res.status(400).json({ message: validationError.message });
        }
        next(err);
      }
    };
  };

  // USER ROUTES
  app.get("/api/users/current", async (req, res) => {
    // This would be protected by auth middleware in a real app
    const user = await storage.getUser(1); // Mock user for now
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve users" });
    }
  });

  app.post("/api/users", validateBody(insertUserSchema), async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const newUser = await storage.createUser(req.body);
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      // Remove password if empty or not provided
      if (!req.body.password) {
        delete req.body.password;
      }
      const updatedUser = await storage.updateUser(id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // CLIENT ROUTES
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve client" });
    }
  });

  app.post("/api/clients", validateBody(insertClientSchema), async (req, res) => {
    try {
      const newClient = await storage.createClient(req.body);
      res.status(201).json(newClient);
    } catch (error) {
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const updatedClient = await storage.updateClient(id, req.body);
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const success = await storage.deleteClient(id);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // TENDER ROUTES
  app.get("/api/tenders", async (req, res) => {
    try {
      const { 
        status, 
        clientId, 
        startDate, 
        endDate, 
        search,
        page = "1",
        limit = "10"
      } = req.query;

      const filters: any = {};
      
      if (status) filters.status = status as string;
      
      if (clientId) {
        const clientIdNum = parseInt(clientId as string);
        if (!isNaN(clientIdNum)) filters.clientId = clientIdNum;
      }
      
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (search) filters.search = search as string;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      const result = await storage.getTenders(
        filters,
        isNaN(pageNum) ? 1 : pageNum,
        isNaN(limitNum) ? 10 : limitNum
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching tenders:", error);
      res.status(500).json({ message: "Failed to retrieve tenders" });
    }
  });

  app.get("/api/tenders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }

      const tender = await storage.getTender(id);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }

      // Get documents associated with this tender
      const documents = await storage.getDocumentsByTenderId(id);
      
      res.json({ ...tender, documents });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve tender" });
    }
  });

  app.post("/api/tenders", validateBody(insertTenderSchema), async (req, res) => {
    try {
      // Check if reference number is already in use
      const existingTender = await storage.getTenderByReference(req.body.referenceNumber);
      if (existingTender) {
        return res.status(400).json({ 
          message: "Reference number is already in use"
        });
      }

      const newTender = await storage.createTender(req.body);
      res.status(201).json(newTender);
    } catch (error) {
      console.error("Error creating tender:", error);
      res.status(500).json({ message: "Failed to create tender" });
    }
  });

  app.put("/api/tenders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }

      // Check if reference number is already in use by a different tender
      if (req.body.referenceNumber) {
        const existingTender = await storage.getTenderByReference(req.body.referenceNumber);
        if (existingTender && existingTender.id !== id) {
          return res.status(400).json({ 
            message: "Reference number is already in use by another tender"
          });
        }
      }

      const updatedTender = await storage.updateTender(id, req.body);
      if (!updatedTender) {
        return res.status(404).json({ message: "Tender not found" });
      }

      res.json(updatedTender);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tender" });
    }
  });

  app.delete("/api/tenders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }

      const success = await storage.deleteTender(id);
      if (!success) {
        return res.status(404).json({ message: "Tender not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tender" });
    }
  });

  // DOCUMENT ROUTES
  app.get("/api/tenders/:tenderId/documents", async (req, res) => {
    try {
      const tenderId = parseInt(req.params.tenderId);
      if (isNaN(tenderId)) {
        return res.status(400).json({ message: "Invalid tender ID" });
      }

      const documents = await storage.getDocumentsByTenderId(tenderId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve documents" });
    }
  });

  app.post("/api/documents", validateBody(insertDocumentSchema), async (req, res) => {
    try {
      const newDocument = await storage.createDocument(req.body);
      res.status(201).json(newDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const success = await storage.deleteDocument(id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // ROLE ROUTES
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getRoles();
      
      // For each role, get the count of users
      const rolesWithCounts = await Promise.all(
        roles.map(async (role) => {
          const usersCount = await storage.getUsersCountByRoleId(role.id);
          return {
            ...role,
            usersCount
          };
        })
      );
      
      res.json(rolesWithCounts);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to retrieve roles" });
    }
  });

  app.get("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }

      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      const usersCount = await storage.getUsersCountByRoleId(id);
      res.json({ ...role, usersCount });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve role" });
    }
  });

  app.post("/api/roles", validateBody(insertRoleSchema), async (req, res) => {
    try {
      const newRole = await storage.createRole(req.body);
      res.status(201).json(newRole);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  app.put("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }

      const updatedRole = await storage.updateRole(id, req.body);
      if (!updatedRole) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.json(updatedRole);
    } catch (error) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }

      // Check if there are users with this role
      const usersCount = await storage.getUsersCountByRoleId(id);
      if (usersCount > 0) {
        return res.status(400).json({ 
          message: "Cannot delete role that has assigned users",
          usersCount
        });
      }

      const success = await storage.deleteRole(id);
      if (!success) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // COMPANY ROUTES
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to retrieve companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve company" });
    }
  });

  app.post("/api/companies", validateBody(insertCompanySchema), async (req, res) => {
    try {
      const newCompany = await storage.createCompany(req.body);
      res.status(201).json(newCompany);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.put("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const updatedCompany = await storage.updateCompany(id, req.body);
      if (!updatedCompany) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(updatedCompany);
    } catch (error) {
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const success = await storage.deleteCompany(id);
      if (!success) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // CUSTOMER ROUTES
  app.get("/api/customers", async (req, res) => {
    try {
      const { status, type, search } = req.query;
      const filters: { status?: string, type?: string, search?: string } = {};
      
      if (status && typeof status === 'string') {
        filters.status = status;
      }
      
      if (type && typeof type === 'string') {
        filters.type = type;
      }
      
      if (search && typeof search === 'string') {
        filters.search = search;
      }
      
      const customers = await storage.getCustomers(filters);
      res.status(200).json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.status(200).json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });
  
  app.post("/api/customers", validateBody(insertCustomerSchema), async (req, res) => {
    try {
      const newCustomer = await storage.createCustomer(req.body);
      res.status(201).json(newCustomer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });
  
  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customer = await storage.updateCustomer(id, req.body);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.status(200).json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  
  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // ACTIVITY ROUTES
  app.get("/api/activities/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve activities" });
    }
  });
  
  app.post("/api/activities", validateBody(insertActivitySchema), async (req, res) => {
    try {
      const newActivity = await storage.createActivity(req.body);
      res.status(201).json(newActivity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to log activity" });
    }
  });

  // LEAD ROUTES
  app.get("/api/leads", async (req, res) => {
    try {
      const { status, source, search } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status as string;
      if (source) filters.source = source as string;
      if (search) filters.search = search as string;
      
      const leads = await storage.getLeads(filters);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to retrieve leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }
      
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve lead" });
    }
  });

  app.post("/api/leads", validateBody(insertLeadSchema), async (req, res) => {
    try {
      const newLead = await storage.createLead(req.body);
      res.status(201).json(newLead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }
      
      const updatedLead = await storage.updateLead(id, req.body);
      if (!updatedLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(updatedLead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }
      
      const success = await storage.deleteLead(id);
      if (!success) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
