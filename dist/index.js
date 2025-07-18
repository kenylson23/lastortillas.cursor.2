var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  contacts: () => contacts,
  insertContactSchema: () => insertContactSchema,
  insertMenuItemSchema: () => insertMenuItemSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertReservationSchema: () => insertReservationSchema,
  insertTableSchema: () => insertTableSchema,
  menuItems: () => menuItems,
  orderItems: () => orderItems,
  orders: () => orders,
  reservations: () => reservations,
  sessions: () => sessions,
  tables: () => tables,
  users: () => users
});
import { pgTable, text, varchar, serial, integer, boolean, timestamp, numeric, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  guests: integer("guests").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  image: text("image"),
  available: boolean("available").default(true),
  preparationTime: integer("preparation_time").default(15),
  // minutes
  customizations: text("customizations").array(),
  // ["sem cebola", "extra queijo"]
  createdAt: timestamp("created_at").defaultNow()
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  deliveryAddress: text("delivery_address"),
  orderType: text("order_type").notNull(),
  // "delivery", "takeaway", "dine-in"
  locationId: text("location_id").notNull(),
  // "ilha", "talatona", "movel"
  tableId: integer("table_id").references(() => tables.id),
  // mesa para pedidos dine-in
  status: text("status").notNull().default("received"),
  // "received", "preparing", "ready", "delivered", "cancelled"
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  // "cash", "card", "transfer"
  paymentStatus: text("payment_status").notNull().default("pending"),
  // "pending", "paid", "failed"
  notes: text("notes"),
  estimatedDeliveryTime: text("estimated_delivery_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  menuItemId: integer("menu_item_id").references(() => menuItems.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  customizations: text("customizations").array(),
  // customizations for this specific item
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull()
});
var tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  locationId: text("location_id").notNull(),
  // "ilha", "talatona", "movel"
  capacity: integer("capacity").notNull(),
  // número de pessoas
  status: text("status").notNull().default("available"),
  // "available", "occupied", "reserved", "maintenance"
  position: text("position"),
  // "janela", "centro", "varanda", etc.
  features: text("features").array(),
  // ["ar_condicionado", "vista_mar", "kids_area"]
  notes: text("notes"),
  // observações especiais
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true
});
var insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true
});
var insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  estimatedDeliveryTime: z.string().optional()
});
var insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  orderId: true
});
var insertTableSchema = createInsertSchema(tables).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 3e4,
  connectionTimeoutMillis: 2e3,
  ssl: {
    rejectUnauthorized: false
  }
});
pool.on("error", (err) => {
  console.error("Database pool error:", err);
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, ne } from "drizzle-orm";
var DatabaseStorage = class {
  initializationPromise = null;
  constructor() {
  }
  async ensureInitialized() {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeSampleMenuItems();
    }
    await this.initializationPromise;
  }
  async initializeSampleMenuItems() {
    try {
      await db.select().from(menuItems).limit(1);
      const existingItems = await db.select().from(menuItems);
      if (existingItems.length === 0) {
        const sampleItems = [
          {
            name: "Tacos al Pastor",
            description: "Tacos tradicionais com carne de porco marinada, abacaxi e coentro",
            price: "2500",
            category: "Tacos",
            image: "/api/placeholder/400/300",
            available: true
          },
          {
            name: "Burrito Supremo",
            description: "Burrito gigante com carne, feij\xE3o, arroz, queijo e molho especial",
            price: "3200",
            category: "Burritos",
            image: "/api/placeholder/400/300",
            available: true
          },
          {
            name: "Quesadilla de Queijo",
            description: "Tortilla crocante recheada com queijo derretido e temperos",
            price: "2000",
            category: "Quesadillas",
            image: "/api/placeholder/400/300",
            available: true
          },
          {
            name: "Nachos Especiais",
            description: "Chips de tortilla com queijo derretido, guacamole e molho picante",
            price: "2800",
            category: "Aperitivos",
            image: "/api/placeholder/400/300",
            available: true
          },
          {
            name: "Enchiladas Verdes",
            description: "Tortillas recheadas com frango e cobertas com molho verde",
            price: "3000",
            category: "Enchiladas",
            image: "/api/placeholder/400/300",
            available: true
          },
          {
            name: "Fajitas de Frango",
            description: "Frango grelhado com pimentos e cebolas, servido com tortillas",
            price: "3500",
            category: "Fajitas",
            image: "/api/placeholder/400/300",
            available: true
          }
        ];
        for (const item of sampleItems) {
          await db.insert(menuItems).values(item);
        }
        console.log("Sample menu items initialized successfully");
      }
    } catch (error) {
      console.error("Error initializing sample menu items:", error);
    }
  }
  // Reservation operations
  async createReservation(insertReservation) {
    await this.ensureInitialized();
    const [reservation] = await db.insert(reservations).values(insertReservation).returning();
    return reservation;
  }
  async createContact(insertContact) {
    await this.ensureInitialized();
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }
  async getAllReservations() {
    await this.ensureInitialized();
    return await db.select().from(reservations);
  }
  async checkAvailability(date, time) {
    await this.ensureInitialized();
    const existing = await db.select().from(reservations).where(and(eq(reservations.date, date), eq(reservations.time, time)));
    return existing.length === 0;
  }
  async getReservationsByDate(date) {
    await this.ensureInitialized();
    return await db.select().from(reservations).where(eq(reservations.date, date));
  }
  // Menu Items
  async getAllMenuItems() {
    await this.ensureInitialized();
    return await db.select().from(menuItems);
  }
  async getMenuItemsByCategory(category) {
    await this.ensureInitialized();
    return await db.select().from(menuItems).where(eq(menuItems.category, category));
  }
  async getMenuItem(id) {
    await this.ensureInitialized();
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }
  async createMenuItem(insertItem) {
    await this.ensureInitialized();
    const [item] = await db.insert(menuItems).values(insertItem).returning();
    return item;
  }
  async updateMenuItem(id, updates) {
    await this.ensureInitialized();
    const { id: itemId, createdAt, ...validUpdates } = updates;
    const [item] = await db.update(menuItems).set(validUpdates).where(eq(menuItems.id, id)).returning();
    return item;
  }
  async deleteMenuItem(id) {
    await this.ensureInitialized();
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }
  // Orders
  async createOrder(insertOrder, items) {
    await this.ensureInitialized();
    const [order] = await db.insert(orders).values(insertOrder).returning();
    await db.insert(orderItems).values(
      items.map((item) => ({ ...item, orderId: order.id }))
    );
    if (order.orderType === "dine-in" && order.tableId) {
      console.log(`Marking table ${order.tableId} as occupied for order ${order.id}`);
      await db.update(tables).set({ status: "occupied", updatedAt: /* @__PURE__ */ new Date() }).where(eq(tables.id, order.tableId));
      console.log(`Table ${order.tableId} marked as occupied`);
    } else {
      console.log(`Order ${order.id} - orderType: ${order.orderType}, tableId: ${order.tableId}`);
    }
    return order;
  }
  async getOrder(id) {
    await this.ensureInitialized();
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  async getAllOrders() {
    await this.ensureInitialized();
    return await db.select().from(orders);
  }
  async getOrdersByStatus(status) {
    await this.ensureInitialized();
    return await db.select().from(orders).where(eq(orders.status, status));
  }
  async getOrdersByLocation(locationId) {
    await this.ensureInitialized();
    return await db.select().from(orders).where(eq(orders.locationId, locationId));
  }
  async updateOrderStatus(id, status) {
    await this.ensureInitialized();
    const [currentOrder] = await db.select().from(orders).where(eq(orders.id, id));
    const [order] = await db.update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
    if (currentOrder && currentOrder.orderType === "dine-in" && currentOrder.tableId && (status === "delivered" || status === "cancelled")) {
      await db.update(tables).set({ status: "available", updatedAt: /* @__PURE__ */ new Date() }).where(eq(tables.id, currentOrder.tableId));
    }
    return order;
  }
  async deleteOrder(id) {
    await this.ensureInitialized();
    const [currentOrder] = await db.select().from(orders).where(eq(orders.id, id));
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    await db.delete(orders).where(eq(orders.id, id));
    if (currentOrder && currentOrder.orderType === "dine-in" && currentOrder.tableId) {
      await db.update(tables).set({ status: "available", updatedAt: /* @__PURE__ */ new Date() }).where(eq(tables.id, currentOrder.tableId));
    }
  }
  async getOrderItems(orderId) {
    await this.ensureInitialized();
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  // Tables operations
  async getAllTables() {
    await this.ensureInitialized();
    return await db.select().from(tables);
  }
  async getTablesByLocation(locationId) {
    await this.ensureInitialized();
    return await db.select().from(tables).where(eq(tables.locationId, locationId));
  }
  async getTable(id) {
    await this.ensureInitialized();
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table;
  }
  async createTable(insertTable) {
    await this.ensureInitialized();
    console.log(`\u{1F50D} Verificando duplica\xE7\xE3o para mesa ${insertTable.number} no local ${insertTable.locationId}`);
    const existingTable = await db.select().from(tables).where(and(
      eq(tables.locationId, insertTable.locationId),
      eq(tables.number, insertTable.number)
    ));
    console.log(`\u{1F50D} Encontradas ${existingTable.length} mesas existentes:`, existingTable);
    if (existingTable.length > 0) {
      throw new Error(`J\xE1 existe uma mesa n\xFAmero ${insertTable.number} no local ${insertTable.locationId}`);
    }
    const [table] = await db.insert(tables).values(insertTable).returning();
    return table;
  }
  async updateTable(id, updates) {
    await this.ensureInitialized();
    if (updates.number !== void 0 || updates.locationId !== void 0) {
      const currentTable = await this.getTable(id);
      if (!currentTable) {
        throw new Error("Mesa n\xE3o encontrada");
      }
      const newNumber = updates.number !== void 0 ? updates.number : currentTable.number;
      const newLocationId = updates.locationId !== void 0 ? updates.locationId : currentTable.locationId;
      const existingTable = await db.select().from(tables).where(and(
        eq(tables.locationId, newLocationId),
        eq(tables.number, newNumber),
        ne(tables.id, id)
        // Excluir a mesa atual da verificação
      ));
      if (existingTable.length > 0) {
        throw new Error(`J\xE1 existe uma mesa n\xFAmero ${newNumber} no local ${newLocationId}`);
      }
    }
    const [table] = await db.update(tables).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tables.id, id)).returning();
    return table;
  }
  async deleteTable(id) {
    await this.ensureInitialized();
    await db.delete(tables).where(eq(tables.id, id));
  }
  async updateTableStatus(id, status) {
    await this.ensureInitialized();
    const [table] = await db.update(tables).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tables.id, id)).returning();
    return table;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
var availabilityCache = /* @__PURE__ */ new Map();
var CACHE_DURATION = 5e3;
var reservationsCache = /* @__PURE__ */ new Map();
var RESERVATIONS_CACHE_DURATION = 30 * 1e3;
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of availabilityCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      availabilityCache.delete(key);
    }
  }
  for (const [key, value] of reservationsCache.entries()) {
    if (now - value.timestamp > RESERVATIONS_CACHE_DURATION) {
      reservationsCache.delete(key);
    }
  }
}
setInterval(cleanExpiredCache, 30 * 1e3);
var uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "menu-" + uniqueSuffix + path.extname(file.originalname));
  }
});
var upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos de imagem s\xE3o permitidos"));
    }
  }
});
async function registerRoutes(app2) {
  app2.use((req, res, next) => {
    if (req.url.startsWith("/api/")) {
      res.set("Cache-Control", "public, max-age=5");
    }
    res.set("X-Content-Type-Options", "nosniff");
    res.set("X-Frame-Options", "DENY");
    res.set("X-XSS-Protection", "1; mode=block");
    next();
  });
  app2.get("/api/availability", async (req, res) => {
    try {
      const { date, time } = req.query;
      if (!date || !time) {
        return res.status(400).json({ message: "Date and time are required" });
      }
      const cacheKey = `${date}-${time}`;
      const cached = availabilityCache.get(cacheKey);
      const now = Date.now();
      if (cached && now - cached.timestamp < CACHE_DURATION) {
        res.set("Cache-Control", "public, max-age=5");
        res.set("X-Cache", "HIT");
        return res.json({ available: cached.available });
      }
      const isAvailable = await storage.checkAvailability(date, time);
      availabilityCache.set(cacheKey, { available: isAvailable, timestamp: now });
      res.set("Cache-Control", "public, max-age=5");
      res.set("X-Cache", "MISS");
      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ message: "Failed to check availability" });
    }
  });
  app2.post("/api/reservations", async (req, res) => {
    try {
      const reservation = insertReservationSchema.parse(req.body);
      const newReservation = await storage.createReservation(reservation);
      const cacheKey = `${reservation.date}-${reservation.time}`;
      availabilityCache.delete(cacheKey);
      const reservationsCacheKey = `reservations-${reservation.date}`;
      reservationsCache.delete(reservationsCacheKey);
      res.json(newReservation);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid reservation data", errors: error.errors });
      } else if (error instanceof Error && error.message === "Hor\xE1rio j\xE1 reservado") {
        res.status(409).json({ message: "Hor\xE1rio j\xE1 reservado. Escolha outro hor\xE1rio." });
      } else {
        res.status(500).json({ message: "Failed to create reservation" });
      }
    }
  });
  app2.post("/api/contacts", async (req, res) => {
    try {
      const contact = insertContactSchema.parse(req.body);
      const newContact = await storage.createContact(contact);
      res.json(newContact);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create contact" });
      }
    }
  });
  app2.get("/api/reservations/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const cacheKey = `reservations-${date}`;
      const cached = reservationsCache.get(cacheKey);
      const now = Date.now();
      if (cached && now - cached.timestamp < RESERVATIONS_CACHE_DURATION) {
        return res.json(cached.data);
      }
      const reservations2 = await storage.getReservationsByDate(date);
      reservationsCache.set(cacheKey, { data: reservations2, timestamp: now });
      res.json(reservations2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reservations for date" });
    }
  });
  app2.get("/api/reservations", async (req, res) => {
    try {
      const reservations2 = await storage.getAllReservations();
      res.json(reservations2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });
  app2.get("/api/menu-items", async (req, res) => {
    try {
      const menuItems2 = await storage.getAllMenuItems();
      res.json(menuItems2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/menu-items", async (req, res) => {
    try {
      const validatedItem = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(validatedItem);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
  app2.put("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      if (updates.name && typeof updates.name !== "string") {
        return res.status(400).json({ error: "Nome deve ser uma string" });
      }
      if (updates.price && typeof updates.price !== "string") {
        return res.status(400).json({ error: "Pre\xE7o deve ser uma string" });
      }
      if (updates.category && typeof updates.category !== "string") {
        return res.status(400).json({ error: "Categoria deve ser uma string" });
      }
      const menuItem = await storage.updateMenuItem(id, updates);
      res.json(menuItem);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingItem = await storage.getMenuItem(id);
      if (!existingItem) {
        return res.status(404).json({ error: "Item n\xE3o encontrado" });
      }
      await storage.deleteMenuItem(id);
      res.json({ message: "Item removido com sucesso" });
    } catch (error) {
      console.error("Erro ao remover item:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/menu", async (req, res) => {
    try {
      const menuItems2 = await storage.getAllMenuItems();
      res.json(menuItems2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/menu/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const menuItems2 = await storage.getMenuItemsByCategory(category);
      res.json(menuItems2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItem(id);
      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    res.json({
      id: "admin",
      email: "admin@lastortillas.com",
      firstName: "Admin",
      lastName: "User"
    });
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      console.log("Received order request:", JSON.stringify(req.body, null, 2));
      const { order, items } = req.body;
      if (!order) {
        return res.status(400).json({ error: "Order data is required" });
      }
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Items array is required" });
      }
      const validatedOrder = insertOrderSchema.parse(order);
      console.log("Validated order:", validatedOrder);
      const validatedItems = items.map((item) => {
        console.log("Validating item:", item);
        return insertOrderItemSchema.parse(item);
      });
      console.log("Validated items:", validatedItems);
      const result = await storage.createOrder(validatedOrder, validatedItems);
      res.json(result);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ error: error.message });
    }
  });
  app2.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!["received", "preparing", "ready", "delivered", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const updatedOrder = await storage.updateOrderStatus(id, status);
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    try {
      const { status, location } = req.query;
      let orders2;
      if (status) {
        orders2 = await storage.getOrdersByStatus(status);
      } else if (location) {
        orders2 = await storage.getOrdersByLocation(location);
      } else {
        orders2 = await storage.getAllOrders();
      }
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const items = await storage.getOrderItems(id);
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingOrder = await storage.getOrder(id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Pedido n\xE3o encontrado" });
      }
      await storage.deleteOrder(id);
      res.json({ message: "Pedido removido com sucesso" });
    } catch (error) {
      console.error("Erro ao remover pedido:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/upload-image", upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem foi enviada" });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ error: "Erro ao processar upload da imagem" });
    }
  });
  app2.get("/api/tables", async (req, res) => {
    try {
      const { location } = req.query;
      let tables2;
      if (location) {
        tables2 = await storage.getTablesByLocation(location);
      } else {
        tables2 = await storage.getAllTables();
      }
      res.json(tables2);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/tables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const table = await storage.getTable(id);
      if (!table) {
        return res.status(404).json({ error: "Mesa n\xE3o encontrada" });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/tables", async (req, res) => {
    try {
      const validatedData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(validatedData);
      res.status(201).json(table);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Dados inv\xE1lidos", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/tables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTable = await storage.getTable(id);
      if (!existingTable) {
        return res.status(404).json({ error: "Mesa n\xE3o encontrada" });
      }
      const table = await storage.updateTable(id, req.body);
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.patch("/api/tables/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!status || !["available", "occupied", "reserved", "maintenance"].includes(status)) {
        return res.status(400).json({ error: "Status inv\xE1lido" });
      }
      const table = await storage.updateTableStatus(id, status);
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/tables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTable = await storage.getTable(id);
      if (!existingTable) {
        return res.status(404).json({ error: "Mesa n\xE3o encontrada" });
      }
      await storage.deleteTable(id);
      res.json({ message: "Mesa removida com sucesso" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import path4 from "path";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use("/attached_assets", express2.static(path4.join(process.cwd(), "attached_assets")));
app.use(express2.static(path4.join(process.cwd(), "public")));
app.use("/uploads", express2.static(path4.join(process.cwd(), "public", "uploads")));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
