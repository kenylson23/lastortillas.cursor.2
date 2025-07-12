import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReservationSchema, insertContactSchema, insertOrderSchema, insertOrderItemSchema, insertMenuItemSchema } from "@shared/schema";
import { z } from "zod";
// Cache otimizado para verificação de disponibilidade
const availabilityCache = new Map<string, { available: boolean; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 segundos para dados mais atualizados

// Cache para resultados de reservas por data
const reservationsCache = new Map<string, { data: any[]; timestamp: number }>();
const RESERVATIONS_CACHE_DURATION = 30 * 1000; // 30 segundos

// Função para limpar cache expirado
function cleanExpiredCache() {
  const now = Date.now();
  
  // Limpar cache de disponibilidade
  for (const [key, value] of availabilityCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      availabilityCache.delete(key);
    }
  }
  
  // Limpar cache de reservas
  for (const [key, value] of reservationsCache.entries()) {
    if (now - value.timestamp > RESERVATIONS_CACHE_DURATION) {
      reservationsCache.delete(key);
    }
  }
}

// Executar limpeza do cache a cada 30 segundos
setInterval(cleanExpiredCache, 30 * 1000);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Headers otimizados para performance
  app.use((req, res, next) => {
    // Headers de cache para APIs
    if (req.url.startsWith('/api/')) {
      res.set('Cache-Control', 'public, max-age=5'); // 5 segundos para APIs
    }
    
    // Headers de segurança e performance
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    
    next();
  });

  // Check availability endpoint com cache
  app.get("/api/availability", async (req, res) => {
    try {
      const { date, time } = req.query;
      
      if (!date || !time) {
        return res.status(400).json({ message: "Date and time are required" });
      }
      
      const cacheKey = `${date}-${time}`;
      const cached = availabilityCache.get(cacheKey);
      const now = Date.now();
      
      // Verificar se cache é válido
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        // Headers de cache para resposta cacheada
        res.set('Cache-Control', 'public, max-age=5');
        res.set('X-Cache', 'HIT');
        return res.json({ available: cached.available });
      }
      
      const isAvailable = await storage.checkAvailability(date as string, time as string);
      
      // Armazenar no cache
      availabilityCache.set(cacheKey, { available: isAvailable, timestamp: now });
      
      // Headers de cache para resposta nova
      res.set('Cache-Control', 'public, max-age=5');
      res.set('X-Cache', 'MISS');
      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Reservation endpoint
  app.post("/api/reservations", async (req, res) => {
    try {
      const reservation = insertReservationSchema.parse(req.body);
      const newReservation = await storage.createReservation(reservation);
      
      // Limpar cache após criação de reserva
      const cacheKey = `${reservation.date}-${reservation.time}`;
      availabilityCache.delete(cacheKey);
      
      // Limpar cache de reservas para a data
      const reservationsCacheKey = `reservations-${reservation.date}`;
      reservationsCache.delete(reservationsCacheKey);
      
      res.json(newReservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid reservation data", errors: error.errors });
      } else if (error instanceof Error && error.message === 'Horário já reservado') {
        res.status(409).json({ message: "Horário já reservado. Escolha outro horário." });
      } else {
        res.status(500).json({ message: "Failed to create reservation" });
      }
    }
  });

  // Contact form endpoint
  app.post("/api/contacts", async (req, res) => {
    try {
      const contact = insertContactSchema.parse(req.body);
      const newContact = await storage.createContact(contact);
      res.json(newContact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create contact" });
      }
    }
  });

  // Get reservations by date com cache
  app.get("/api/reservations/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const cacheKey = `reservations-${date}`;
      const cached = reservationsCache.get(cacheKey);
      const now = Date.now();
      
      // Verificar se cache é válido
      if (cached && (now - cached.timestamp) < RESERVATIONS_CACHE_DURATION) {
        return res.json(cached.data);
      }
      
      const reservations = await storage.getReservationsByDate(date);
      
      // Armazenar no cache
      reservationsCache.set(cacheKey, { data: reservations, timestamp: now });
      
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reservations for date" });
    }
  });

  // Get reservations (admin only - simplified for demo)
  app.get("/api/reservations", async (req, res) => {
    try {
      const reservations = await storage.getAllReservations();
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  // Menu Items endpoints for admin
  app.get("/api/menu-items", async (req, res) => {
    try {
      const menuItems = await storage.getAllMenuItems();
      res.json(menuItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/menu-items", async (req, res) => {
    try {
      const validatedItem = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(validatedItem);
      res.status(201).json(menuItem);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.put("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const menuItem = await storage.updateMenuItem(id, updates);
      res.json(menuItem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Menu Items endpoints for customers
  app.get("/api/menu", async (req, res) => {
    try {
      const menuItems = await storage.getAllMenuItems();
      res.json(menuItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/menu/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const menuItems = await storage.getMenuItemsByCategory(category);
      res.json(menuItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItem(id);
      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Simplified auth - no authentication required
  app.get('/api/auth/user', async (req, res) => {
    // Return a simple admin user for development
    res.json({ 
      id: 'admin', 
      email: 'admin@lastortillas.com', 
      firstName: 'Admin', 
      lastName: 'User' 
    });
  });

  // Orders endpoints
  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = req.body;
      
      // Validate order
      const validatedOrder = insertOrderSchema.parse(order);
      
      // Validate items
      const validatedItems = items.map((item: any) => insertOrderItemSchema.parse(item));
      
      const result = await storage.createOrder(validatedOrder, validatedItems);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const { status, location } = req.query;
      
      let orders;
      if (status) {
        orders = await storage.getOrdersByStatus(status as string);
      } else if (location) {
        orders = await storage.getOrdersByLocation(location as string);
      } else {
        orders = await storage.getAllOrders();
      }
      
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const items = await storage.getOrderItems(id);
      res.json({ ...order, items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
