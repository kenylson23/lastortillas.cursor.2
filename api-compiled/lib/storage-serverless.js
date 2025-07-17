"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.ServerlessStorage = void 0;
exports.createStorage = createStorage;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../shared/schema");
const database_1 = require("./database");
const serverless_utils_1 = require("./serverless-utils");
/**
 * SERVERLESS STORAGE CLASS
 * Optimized for Vercel serverless functions with unique connections per request
 */
class ServerlessStorage {
    constructor() {
        this.db = (0, database_1.getDatabase)();
        (0, serverless_utils_1.serverlessLog)('🔌 ServerlessStorage instance created');
    }
    async cleanup() {
        try {
            await (0, database_1.closeConnection)(this.db);
            (0, serverless_utils_1.serverlessLog)('🔌 Database connection closed');
        }
        catch (error) {
            (0, serverless_utils_1.serverlessLog)('⚠️ Error closing connection:', error);
        }
    }
    // Reservations
    async createReservation(reservation) {
        const [result] = await this.db.insert(schema_1.reservations).values(reservation).returning();
        return result;
    }
    async createContact(contact) {
        const [result] = await this.db.insert(schema_1.contacts).values(contact).returning();
        return result;
    }
    async getAllReservations() {
        return await this.db.select().from(schema_1.reservations).orderBy((0, drizzle_orm_1.desc)(schema_1.reservations.createdAt));
    }
    async checkAvailability(date, time) {
        const existingReservations = await this.db
            .select()
            .from(schema_1.reservations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.reservations.date, date), (0, drizzle_orm_1.eq)(schema_1.reservations.time, time)));
        return existingReservations.length === 0;
    }
    async getReservationsByDate(date) {
        return await this.db
            .select()
            .from(schema_1.reservations)
            .where((0, drizzle_orm_1.eq)(schema_1.reservations.date, date))
            .orderBy(schema_1.reservations.time);
    }
    // Menu Items
    async getAllMenuItems() {
        return await this.db.select().from(schema_1.menuItems).orderBy(schema_1.menuItems.name);
    }
    async getMenuItemsByCategory(category) {
        return await this.db
            .select()
            .from(schema_1.menuItems)
            .where((0, drizzle_orm_1.eq)(schema_1.menuItems.category, category))
            .orderBy(schema_1.menuItems.name);
    }
    async getMenuItem(id) {
        const result = await this.db
            .select()
            .from(schema_1.menuItems)
            .where((0, drizzle_orm_1.eq)(schema_1.menuItems.id, id))
            .limit(1);
        return result[0];
    }
    async createMenuItem(item) {
        const [result] = await this.db.insert(schema_1.menuItems).values(item).returning();
        return result;
    }
    async updateMenuItem(id, item) {
        const [result] = await this.db
            .update(schema_1.menuItems)
            .set(item)
            .where((0, drizzle_orm_1.eq)(schema_1.menuItems.id, id))
            .returning();
        return result;
    }
    async deleteMenuItem(id) {
        await this.db.delete(schema_1.menuItems).where((0, drizzle_orm_1.eq)(schema_1.menuItems.id, id));
    }
    // Orders
    async createOrder(order, items) {
        return await this.db.transaction(async (tx) => {
            const [createdOrder] = await tx.insert(schema_1.orders).values(order).returning();
            const orderItemsWithOrderId = items.map(item => ({
                ...item,
                orderId: createdOrder.id
            }));
            await tx.insert(schema_1.orderItems).values(orderItemsWithOrderId);
            return createdOrder;
        });
    }
    async getOrder(id) {
        const result = await this.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_1.orders.id, id))
            .limit(1);
        return result[0];
    }
    async getAllOrders() {
        return await this.db.select().from(schema_1.orders).orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
    }
    async getOrdersByStatus(status) {
        return await this.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_1.orders.status, status))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
    }
    async getOrdersByLocation(locationId) {
        return await this.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_1.orders.locationId, locationId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
    }
    async updateOrderStatus(id, status) {
        const [result] = await this.db
            .update(schema_1.orders)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.orders.id, id))
            .returning();
        return result;
    }
    async deleteOrder(id) {
        await this.db.transaction(async (tx) => {
            await tx.delete(schema_1.orderItems).where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, id));
            await tx.delete(schema_1.orders).where((0, drizzle_orm_1.eq)(schema_1.orders.id, id));
        });
    }
    // Order Items
    async getOrderItems(orderId) {
        return await this.db
            .select()
            .from(schema_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, orderId));
    }
    // Tables
    async getAllTables() {
        return await this.db.select().from(schema_1.tables).orderBy(schema_1.tables.tableNumber);
    }
    async getTablesByLocation(locationId) {
        return await this.db
            .select()
            .from(schema_1.tables)
            .where((0, drizzle_orm_1.eq)(schema_1.tables.locationId, locationId))
            .orderBy(schema_1.tables.tableNumber);
    }
    async getTable(id) {
        const result = await this.db
            .select()
            .from(schema_1.tables)
            .where((0, drizzle_orm_1.eq)(schema_1.tables.id, id))
            .limit(1);
        return result[0];
    }
    async createTable(table) {
        const [result] = await this.db.insert(schema_1.tables).values(table).returning();
        return result;
    }
    async updateTable(id, table) {
        const [result] = await this.db
            .update(schema_1.tables)
            .set(table)
            .where((0, drizzle_orm_1.eq)(schema_1.tables.id, id))
            .returning();
        return result;
    }
    async deleteTable(id) {
        await this.db.delete(schema_1.tables).where((0, drizzle_orm_1.eq)(schema_1.tables.id, id));
    }
    async updateTableStatus(id, status) {
        const [result] = await this.db
            .update(schema_1.tables)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.tables.id, id))
            .returning();
        return result;
    }
}
exports.ServerlessStorage = ServerlessStorage;
// Export instance factory function for serverless
function createStorage() {
    return new ServerlessStorage();
}
// Export as storage.ts replacement
exports.storage = new ServerlessStorage();
