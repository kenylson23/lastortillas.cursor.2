"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectTableSchema = exports.insertTableSchema = exports.selectContactSchema = exports.insertContactSchema = exports.selectReservationSchema = exports.insertReservationSchema = exports.selectOrderItemSchema = exports.insertOrderItemSchema = exports.selectOrderSchema = exports.insertOrderSchema = exports.selectMenuItemSchema = exports.insertMenuItemSchema = exports.selectUserSchema = exports.insertUserSchema = exports.tables = exports.contacts = exports.reservations = exports.orderItems = exports.orders = exports.menuItems = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// Users table  
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    email: (0, pg_core_1.text)('email').unique(),
    firstName: (0, pg_core_1.text)('first_name'),
    lastName: (0, pg_core_1.text)('last_name'),
    profileImageUrl: (0, pg_core_1.text)('profile_image_url'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
// Menu Items table
exports.menuItems = (0, pg_core_1.pgTable)('menu_items', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    price: (0, pg_core_1.integer)('price').notNull(), // in cents
    category: (0, pg_core_1.text)('category').notNull(),
    available: (0, pg_core_1.boolean)('available').notNull().default(true),
    image: (0, pg_core_1.text)('image'),
    preparationTime: (0, pg_core_1.integer)('preparation_time'), // in minutes
    customizations: (0, pg_core_1.text)('customizations').array(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Orders table
exports.orders = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    customerName: (0, pg_core_1.text)('customer_name').notNull(),
    customerPhone: (0, pg_core_1.text)('customer_phone').notNull(),
    customerEmail: (0, pg_core_1.text)('customer_email'),
    deliveryAddress: (0, pg_core_1.text)('delivery_address'),
    orderType: (0, pg_core_1.text)('order_type').notNull(), // 'delivery' or 'pickup'
    locationId: (0, pg_core_1.text)('location_id').notNull(),
    tableId: (0, pg_core_1.integer)('table_id'),
    totalAmount: (0, pg_core_1.integer)('total_amount').notNull(),
    status: (0, pg_core_1.text)('status').notNull().default('pending'),
    preparationTime: (0, pg_core_1.integer)('preparation_time'), // in minutes
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Order Items table
exports.orderItems = (0, pg_core_1.pgTable)('order_items', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    orderId: (0, pg_core_1.integer)('order_id').notNull(),
    menuItemId: (0, pg_core_1.integer)('menu_item_id').notNull(),
    quantity: (0, pg_core_1.integer)('quantity').notNull(),
    unitPrice: (0, pg_core_1.integer)('unit_price').notNull(),
    customizations: (0, pg_core_1.text)('customizations').array(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Reservations table
exports.reservations = (0, pg_core_1.pgTable)('reservations', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    phone: (0, pg_core_1.text)('phone').notNull(),
    email: (0, pg_core_1.text)('email'),
    date: (0, pg_core_1.text)('date').notNull(),
    time: (0, pg_core_1.text)('time').notNull(),
    guests: (0, pg_core_1.integer)('guests').notNull(),
    locationId: (0, pg_core_1.text)('location_id').notNull(),
    tableId: (0, pg_core_1.integer)('table_id'),
    status: (0, pg_core_1.text)('status').notNull().default('pending'),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Contacts table
exports.contacts = (0, pg_core_1.pgTable)('contacts', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    email: (0, pg_core_1.text)('email').notNull(),
    phone: (0, pg_core_1.text)('phone'),
    message: (0, pg_core_1.text)('message').notNull(),
    status: (0, pg_core_1.text)('status').notNull().default('pending'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Tables table
exports.tables = (0, pg_core_1.pgTable)('tables', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    tableNumber: (0, pg_core_1.integer)('table_number').notNull(),
    seats: (0, pg_core_1.integer)('seats').notNull(),
    status: (0, pg_core_1.text)('status').notNull().default('available'),
    locationId: (0, pg_core_1.text)('location_id').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Zod schemas for validation
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.selectUserSchema = (0, drizzle_zod_1.createSelectSchema)(exports.users);
exports.insertMenuItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.menuItems);
exports.selectMenuItemSchema = (0, drizzle_zod_1.createSelectSchema)(exports.menuItems);
exports.insertOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orders);
exports.selectOrderSchema = (0, drizzle_zod_1.createSelectSchema)(exports.orders);
exports.insertOrderItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orderItems);
exports.selectOrderItemSchema = (0, drizzle_zod_1.createSelectSchema)(exports.orderItems);
exports.insertReservationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.reservations);
exports.selectReservationSchema = (0, drizzle_zod_1.createSelectSchema)(exports.reservations);
exports.insertContactSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contacts);
exports.selectContactSchema = (0, drizzle_zod_1.createSelectSchema)(exports.contacts);
exports.insertTableSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tables);
exports.selectTableSchema = (0, drizzle_zod_1.createSelectSchema)(exports.tables);
