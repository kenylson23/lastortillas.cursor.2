import { pgTable, text, varchar, serial, integer, boolean, timestamp, numeric, jsonb, index } from "drizzle-orm/pg-core";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  guests: integer("guests").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  available: boolean("available").default(true),
  preparationTime: integer("preparation_time").default(15), // minutes
  customizations: text("customizations").array(), // ["sem cebola", "extra queijo"]
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  deliveryAddress: text("delivery_address"),
  orderType: text("order_type").notNull(), // "delivery", "takeaway", "dine-in"
  locationId: text("location_id").notNull(), // "ilha", "talatona", "movel"
  tableId: integer("table_id").references(() => tables.id), // mesa para pedidos dine-in
  status: text("status").notNull().default("received"), // "received", "preparing", "ready", "delivered", "cancelled"
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // "cash", "card", "transfer"
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending", "paid", "failed"
  notes: text("notes"),
  estimatedDeliveryTime: text("estimated_delivery_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  menuItemId: integer("menu_item_id").references(() => menuItems.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  customizations: text("customizations").array(), // customizations for this specific item
  createdAt: timestamp("created_at").defaultNow(),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  locationId: text("location_id").notNull(), // "ilha", "talatona", "movel"
  tableNumber: integer("table_number").notNull(),
  seats: integer("seats").notNull(),
  status: text("status").notNull().default("available"), // "available", "occupied", "reserved", "maintenance"
  qrCode: text("qr_code").unique(), // Código QR único para a mesa
  qrCodeUrl: text("qr_code_url"), // URL completa do QR code 
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas puros (sem drizzle-zod)
export const insertReservationSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  date: z.string().min(1),
  time: z.string().min(1),
  guests: z.number().int().positive(),
  notes: z.string().optional(),
});

export const insertContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

export const insertMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.string().min(1),
  category: z.string().min(1),
  available: z.boolean().default(true),
  preparationTime: z.number().int().positive().default(15),
  customizations: z.array(z.string()).optional(),
});

export const insertOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional(),
  deliveryAddress: z.string().optional(),
  orderType: z.enum(["delivery", "takeaway", "dine-in"]),
  locationId: z.string().min(1),
  tableId: z.number().int().positive().optional(),
  status: z.string().default("received"),
  totalAmount: z.string().min(1),
  paymentMethod: z.enum(["cash", "card", "transfer"]),
  paymentStatus: z.string().default("pending"),
  notes: z.string().optional(),
  estimatedDeliveryTime: z.string().optional(),
});

export const insertOrderItemSchema = z.object({
  menuItemId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unitPrice: z.string().min(1),
  customizations: z.array(z.string()).optional(),
});

export const insertTableSchema = z.object({
  locationId: z.string().min(1),
  tableNumber: z.number().int().positive(),
  seats: z.number().int().positive(),
  status: z.enum(["available", "occupied", "reserved", "maintenance"]).default("available"),
  qrCode: z.string().optional(),
  qrCodeUrl: z.string().optional(),
});

// Types from Drizzle schema inference
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Table = typeof tables.$inferSelect;
export type InsertTable = z.infer<typeof insertTableSchema>;


