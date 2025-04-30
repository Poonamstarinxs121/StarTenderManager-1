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
  insertCompanySchema
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

  const httpServer = createServer(app);
  return httpServer;
}
