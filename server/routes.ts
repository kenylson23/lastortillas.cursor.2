import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  validateCredentials, 
  generateToken, 
  authenticateToken, 
  optionalAuth, 
  requireAdmin,
  type AuthRequest 
} from "./auth";
// Zod schemas for validation (will be replaced with Prisma types)
import { z } from "zod";

// Validation schemas
const insertReservationSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  date: z.string().min(1),
  time: z.string().min(1),
  guests: z.number().min(1),
  notes: z.string().optional(),
});

const insertContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

const insertMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  category: z.string().min(1),
  image: z.string().optional(),
  available: z.boolean().default(true),
  preparationTime: z.number().default(15),
  customizations: z.array(z.string()).default([]),
});

const insertOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional(),
  deliveryAddress: z.string().optional(),
  orderType: z.enum(['delivery', 'takeaway', 'dine-in']),
  locationId: z.string().min(1),
  tableId: z.number().optional(),
  totalAmount: z.number().min(0),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).default('pending'),
  notes: z.string().optional(),
  estimatedDeliveryTime: z.string().optional(),
});

const insertOrderItemSchema = z.object({
  orderId: z.number(),
  menuItemId: z.number(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  customizations: z.array(z.string()).default([]),
});

const insertTableSchema = z.object({
  locationId: z.string().min(1),
  tableNumber: z.number().min(1),
  seats: z.number().min(1),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).default('available'),
});

import multer from "multer";
import path from "path";
import fs from "fs";
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

// Configurar multer para upload de arquivos
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

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

  // ================================
  // AUTHENTICATION ROUTES
  // ================================
  
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          message: 'Username e password são obrigatórios' 
        });
      }

      // Validar credenciais
      const user = await validateCredentials(username, password);
      
      if (!user) {
        return res.status(401).json({ 
          message: 'Credenciais inválidas' 
        });
      }

      // Gerar token JWT
      const token = generateToken(user);

      // Retornar dados do usuário e token
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        token,
        expiresIn: '7d'
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  });

  // Token verification endpoint
  app.get("/api/auth/verify", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Se chegou até aqui, o token é válido
      res.json({
        authenticated: true,
        user: req.user
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        authenticated: false 
      });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      // Para JWT, logout é principalmente client-side (remover token)
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
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
      
      // Validar dados essenciais
      if (updates.name && typeof updates.name !== 'string') {
        return res.status(400).json({ error: "Nome deve ser uma string" });
      }
      if (updates.price && typeof updates.price !== 'string') {
        return res.status(400).json({ error: "Preço deve ser uma string" });
      }
      if (updates.category && typeof updates.category !== 'string') {
        return res.status(400).json({ error: "Categoria deve ser uma string" });
      }
      
      const menuItem = await storage.updateMenuItem(id, updates);
      res.json(menuItem);
    } catch (error: any) {
      console.error("Erro ao atualizar item:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificar se o item existe
      const existingItem = await storage.getMenuItem(id);
      if (!existingItem) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      
      await storage.deleteMenuItem(id);
      res.json({ message: "Item removido com sucesso" });
    } catch (error: any) {
      console.error("Erro ao remover item:", error);
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
      console.log('Received order request:', JSON.stringify(req.body, null, 2));
      
      const { order, items } = req.body;
      
      if (!order) {
        return res.status(400).json({ error: "Order data is required" });
      }
      
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Items array is required" });
      }
      
      // Validate order
      const validatedOrder = insertOrderSchema.parse(order);
      console.log('Validated order:', validatedOrder);
      
      // Validate items
      const validatedItems = items.map((item: any) => {
        console.log('Validating item:', item);
        return insertOrderItemSchema.parse(item);
      });
      console.log('Validated items:', validatedItems);
      
      const result = await storage.createOrder(validatedOrder, validatedItems);
      
      // Send WhatsApp notification (optional - can be implemented later)
      // await sendWhatsAppNotification(result);
      
      res.json(result);
    } catch (error: any) {
      console.error('Order creation error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Update order status
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['received', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      // Send WhatsApp notification about status change (optional)
      // await sendStatusUpdateNotification(updatedOrder);
      
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all orders with optional filtering
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

  // Get specific order with items
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

  // Delete order (admin only)
  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificar se o pedido existe
      const existingOrder = await storage.getOrder(id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }
      
      // Remove order and associated items
      await storage.deleteOrder(id);
      
      res.json({ message: "Pedido removido com sucesso" });
    } catch (error: any) {
      console.error("Erro ao remover pedido:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Upload de imagens
  app.post('/api/upload-image', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ error: 'Erro ao processar upload da imagem' });
    }
  });

  // Tables routes
  
  // Get all tables
  app.get("/api/tables", async (req, res) => {
    try {
      const { location } = req.query;
      let tables;
      
      if (location) {
        tables = await storage.getTablesByLocation(location as string);
      } else {
        tables = await storage.getAllTables();
      }
      res.json(tables);
    } catch (error: any) {
      console.error('Error fetching tables:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific table
  app.get("/api/tables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const table = await storage.getTable(id);
      if (!table) {
        return res.status(404).json({ error: "Mesa não encontrada" });
      }
      res.json(table);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create table
  app.post("/api/tables", async (req, res) => {
    try {
      const validatedData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(validatedData);
      res.status(201).json(table);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update table
  app.put("/api/tables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTable = await storage.getTable(id);
      if (!existingTable) {
        return res.status(404).json({ error: "Mesa não encontrada" });
      }
      
      const table = await storage.updateTable(id, req.body);
      res.json(table);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update table status
  app.patch("/api/tables/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['available', 'occupied', 'reserved', 'maintenance'].includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }
      
      const table = await storage.updateTableStatus(id, status);
      res.json(table);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete table
  app.delete("/api/tables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const existingTable = await storage.getTable(id);
      if (!existingTable) {
        return res.status(404).json({ error: "Mesa não encontrada" });
      }
      
      await storage.deleteTable(id);
      res.json({ message: "Mesa removida com sucesso" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
