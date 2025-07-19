"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTableSchema = exports.insertOrderItemSchema = exports.insertOrderSchema = exports.insertMenuItemSchema = exports.insertContactSchema = exports.insertReservationSchema = exports.tables = exports.orderItems = exports.orders = exports.menuItems = exports.contacts = exports.reservations = exports.users = exports.sessions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// Session storage table for Replit Auth
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
// User storage table for Replit Auth
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().notNull(),
    email: (0, pg_core_1.varchar)("email").unique(),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.reservations = (0, pg_core_1.pgTable)("reservations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    email: (0, pg_core_1.text)("email"),
    date: (0, pg_core_1.text)("date").notNull(),
    time: (0, pg_core_1.text)("time").notNull(),
    guests: (0, pg_core_1.integer)("guests").notNull(),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.contacts = (0, pg_core_1.pgTable)("contacts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    phone: (0, pg_core_1.text)("phone"),
    message: (0, pg_core_1.text)("message").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.menuItems = (0, pg_core_1.pgTable)("menu_items", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    price: (0, pg_core_1.numeric)("price", { precision: 10, scale: 2 }).notNull(),
    category: (0, pg_core_1.text)("category").notNull(),
    image: (0, pg_core_1.text)("image"),
    available: (0, pg_core_1.boolean)("available").default(true),
    preparationTime: (0, pg_core_1.integer)("preparation_time").default(15), // minutes
    customizations: (0, pg_core_1.text)("customizations").array(), // ["sem cebola", "extra queijo"]
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    customerName: (0, pg_core_1.text)("customer_name").notNull(),
    customerPhone: (0, pg_core_1.text)("customer_phone").notNull(),
    customerEmail: (0, pg_core_1.text)("customer_email"),
    deliveryAddress: (0, pg_core_1.text)("delivery_address"),
    orderType: (0, pg_core_1.text)("order_type").notNull(), // "delivery", "takeaway", "dine-in"
    locationId: (0, pg_core_1.text)("location_id").notNull(), // "ilha", "talatona", "movel"
    tableId: (0, pg_core_1.integer)("table_id").references(() => exports.tables.id), // mesa para pedidos dine-in
    status: (0, pg_core_1.text)("status").notNull().default("received"), // "received", "preparing", "ready", "delivered", "cancelled"
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: (0, pg_core_1.text)("payment_method").notNull(), // "cash", "card", "transfer"
    paymentStatus: (0, pg_core_1.text)("payment_status").notNull().default("pending"), // "pending", "paid", "failed"
    notes: (0, pg_core_1.text)("notes"),
    estimatedDeliveryTime: (0, pg_core_1.text)("estimated_delivery_time"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.orderItems = (0, pg_core_1.pgTable)("order_items", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    orderId: (0, pg_core_1.integer)("order_id").references(() => exports.orders.id).notNull(),
    menuItemId: (0, pg_core_1.integer)("menu_item_id").references(() => exports.menuItems.id).notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    unitPrice: (0, pg_core_1.numeric)("unit_price", { precision: 10, scale: 2 }).notNull(),
    customizations: (0, pg_core_1.text)("customizations").array(), // customizations for this specific item
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.tables = (0, pg_core_1.pgTable)("tables", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    locationId: (0, pg_core_1.text)("location_id").notNull(), // "ilha", "talatona", "movel"
    tableNumber: (0, pg_core_1.integer)("table_number").notNull(),
    seats: (0, pg_core_1.integer)("seats").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("available"), // "available", "occupied", "reserved", "maintenance"
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertReservationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.reservations).omit({
    id: true,
    createdAt: true,
});
exports.insertContactSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contacts).omit({
    id: true,
    createdAt: true,
});
exports.insertMenuItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.menuItems).omit({
    id: true,
    createdAt: true,
});
exports.insertOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orders).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    estimatedDeliveryTime: zod_1.z.string().optional(),
});
exports.insertOrderItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orderItems).omit({
    id: true,
    orderId: true,
});
exports.insertTableSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tables).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
