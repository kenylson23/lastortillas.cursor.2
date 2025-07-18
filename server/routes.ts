import { Express, Request, Response } from "express";
import { storage } from "./storage.js";
import {
  insertReservationSchema,
  insertContactSchema,
  insertMenuItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertTableSchema,
} from "@shared/schema";
import multer from "multer";
import { join } from "path";

// Configure multer for image uploads
const upload = multer({
  dest: join(process.cwd(), "public/uploads"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export function registerRoutes(app: Express) {
  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Reservations
  app.get("/api/reservations", async (req: Request, res: Response) => {
    try {
      const reservations = await storage.getReservations();
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/reservations", async (req: Request, res: Response) => {
    try {
      const data = insertReservationSchema.parse(req.body);
      const reservation = await storage.createReservation(data);
      res.status(201).json(reservation);
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Contacts
  app.get("/api/contacts", async (req: Request, res: Response) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/contacts", async (req: Request, res: Response) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(data);
      res.status(201).json(contact);
    } catch (error: any) {
      console.error("Error creating contact:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Menu Items
  app.get("/api/menu-items", async (req: Request, res: Response) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/menu-items", upload.single("image"), async (req: Request, res: Response) => {
    try {
      const data = insertMenuItemSchema.parse({
        ...req.body,
        price: parseFloat(req.body.price),
        available: req.body.available === "true",
        preparationTime: parseInt(req.body.preparationTime),
        customizations: req.body.customizations ? JSON.parse(req.body.customizations) : [],
        image: req.file ? `/uploads/${req.file.filename}` : undefined,
      });
      const menuItem = await storage.createMenuItem(data);
      res.status(201).json(menuItem);
    } catch (error: any) {
      console.error("Error creating menu item:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.patch("/api/menu-items/:id", upload.single("image"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateData: any = { ...req.body };
      
      if (req.body.price) updateData.price = parseFloat(req.body.price);
      if (req.body.available !== undefined) updateData.available = req.body.available === "true";
      if (req.body.preparationTime) updateData.preparationTime = parseInt(req.body.preparationTime);
      if (req.body.customizations) updateData.customizations = JSON.parse(req.body.customizations);
      if (req.file) updateData.image = `/uploads/${req.file.filename}`;

      const menuItem = await storage.updateMenuItem(id, updateData);
      res.json(menuItem);
    } catch (error: any) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/menu-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMenuItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Orders
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      const orderData = insertOrderSchema.parse(order);
      const orderItemsData = items.map((item: any) => insertOrderItemSchema.parse(item));
      
      const createdOrder = await storage.createOrder(orderData, orderItemsData);
      res.status(201).json(createdOrder);
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.patch("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedOrder = await storage.updateOrder(id, req.body);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOrder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Tables
  app.get("/api/tables", async (req: Request, res: Response) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tables", async (req: Request, res: Response) => {
    try {
      const data = insertTableSchema.parse(req.body);
      const table = await storage.createTable(data);
      res.status(201).json(table);
    } catch (error: any) {
      console.error("Error creating table:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.patch("/api/tables/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedTable = await storage.updateTable(id, req.body);
      res.json(updatedTable);
    } catch (error) {
      console.error("Error updating table:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Additional endpoints for specific functionality
  app.get("/api/orders/:id/items", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const items = await storage.getOrderItems(orderId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching order items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tables/available", async (req: Request, res: Response) => {
    try {
      const { locationId } = req.query;
      const availableTables = await storage.getAvailableTables(locationId as string);
      res.json(availableTables);
    } catch (error) {
      console.error("Error fetching available tables:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}