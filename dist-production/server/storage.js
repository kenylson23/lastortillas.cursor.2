"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../shared/schema");
class DatabaseStorage {
    constructor() {
        this.initializationPromise = null;
        // Don't initialize in constructor to avoid blocking the app startup
    }
    async ensureInitialized() {
        if (!this.initializationPromise) {
            this.initializationPromise = this.initializeSampleMenuItems();
        }
        await this.initializationPromise;
    }
    async initializeSampleMenuItems() {
        try {
            // Check if menu items already exist
            const existingItems = await db_1.db.select().from(schema_1.menuItems);
            if (existingItems.length === 0) {
                // Add sample menu items
                const sampleItems = [
                    {
                        name: 'Tacos al Pastor',
                        description: 'Tacos tradicionais com carne de porco marinada, abacaxi e coentro',
                        price: 2500,
                        category: 'Tacos',
                        image: '/api/placeholder/400/300',
                        available: true,
                    },
                    {
                        name: 'Burrito Supremo',
                        description: 'Burrito gigante com carne, feijão, arroz, queijo e molho especial',
                        price: 3200,
                        category: 'Burritos',
                        image: '/api/placeholder/400/300',
                        available: true,
                    },
                    {
                        name: 'Quesadilla de Queijo',
                        description: 'Tortilla crocante recheada com queijo derretido e temperos',
                        price: 2000,
                        category: 'Quesadillas',
                        image: '/api/placeholder/400/300',
                        available: true,
                    },
                    {
                        name: 'Nachos Especiais',
                        description: 'Chips de tortilla com queijo derretido, guacamole e molho picante',
                        price: 2800,
                        category: 'Aperitivos',
                        image: '/api/placeholder/400/300',
                        available: true,
                    },
                    {
                        name: 'Enchiladas Verdes',
                        description: 'Tortillas recheadas com frango e cobertas com molho verde',
                        price: 3000,
                        category: 'Enchiladas',
                        image: '/api/placeholder/400/300',
                        available: true,
                    },
                    {
                        name: 'Fajitas de Frango',
                        description: 'Frango grelhado com pimentos e cebolas, servido com tortillas',
                        price: 3500,
                        category: 'Fajitas',
                        image: '/api/placeholder/400/300',
                        available: true,
                    }
                ];
                await db_1.db.insert(schema_1.menuItems).values(sampleItems);
                console.log('Sample menu items initialized successfully');
            }
        }
        catch (error) {
            console.error('Error initializing sample menu items:', error);
            // Don't throw here, let the app continue without sample data
        }
    }
    // Reservation operations
    async createReservation(insertReservation) {
        await this.ensureInitialized();
        const result = await db_1.db.insert(schema_1.reservations).values(insertReservation).returning();
        return result[0];
    }
    async createContact(insertContact) {
        await this.ensureInitialized();
        const result = await db_1.db.insert(schema_1.contacts).values(insertContact).returning();
        return result[0];
    }
    async getAllReservations() {
        await this.ensureInitialized();
        return await db_1.db.select().from(schema_1.reservations);
    }
    async checkAvailability(date, time) {
        await this.ensureInitialized();
        const existing = await db_1.db.select().from(schema_1.reservations).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.reservations.date, date), (0, drizzle_orm_1.eq)(schema_1.reservations.time, time)));
        return existing.length === 0;
    }
    async getReservationsByDate(date) {
        await this.ensureInitialized();
        return await db_1.db.select().from(schema_1.reservations).where((0, drizzle_orm_1.eq)(schema_1.reservations.date, date));
    }
    // Menu Items
    async getAllMenuItems() {
        await this.ensureInitialized();
        return await db_1.db.select().from(schema_1.menuItems);
    }
    async getMenuItemsByCategory(category) {
        await this.ensureInitialized();
        return await db_1.db.select().from(schema_1.menuItems).where((0, drizzle_orm_1.eq)(schema_1.menuItems.category, category));
    }
    async getMenuItem(id) {
        await this.ensureInitialized();
        const result = await db_1.db.select().from(schema_1.menuItems).where((0, drizzle_orm_1.eq)(schema_1.menuItems.id, id));
        return result[0] || undefined;
    }
    async createMenuItem(insertItem) {
        await this.ensureInitialized();
        const result = await db_1.db.insert(schema_1.menuItems).values(insertItem).returning();
        return result[0];
    }
    async updateMenuItem(id, updates) {
        await this.ensureInitialized();
        // Remove campos que não devem ser atualizados manualmente
        const { id: itemId, createdAt, ...validUpdates } = updates;
        const result = await db_1.db.update(schema_1.menuItems)
            .set(validUpdates)
            .where((0, drizzle_orm_1.eq)(schema_1.menuItems.id, id))
            .returning();
        return result[0];
    }
    async deleteMenuItem(id) {
        await this.ensureInitialized();
        await db_1.db.delete(schema_1.menuItems).where((0, drizzle_orm_1.eq)(schema_1.menuItems.id, id));
    }
    // Orders
    async createOrder(insertOrder, items) {
        await this.ensureInitialized();
        // Create order first
        const orderResult = await db_1.db.insert(schema_1.orders).values(insertOrder).returning();
        const order = orderResult[0];
        // Create order items with the order ID
        const orderItemsWithOrderId = items.map(item => ({
            ...item,
            orderId: order.id
        }));
        await db_1.db.insert(schema_1.orderItems).values(orderItemsWithOrderId);
        // If it's a dine-in order with a table, mark the table as occupied
        if (order.orderType === 'dine-in' && order.tableId) {
            console.log(`Marking table ${order.tableId} as occupied for order ${order.id}`);
            await db_1.db.update(schema_1.tables)
                .set({ status: 'occupied' })
                .where((0, drizzle_orm_1.eq)(schema_1.tables.id, order.tableId));
            console.log(`Table ${order.tableId} marked as occupied`);
        }
        else {
            console.log(`Order ${order.id} - orderType: ${order.orderType}, tableId: ${order.tableId}`);
        }
        return order;
    }
    async getOrder(id) {
        await this.ensureInitialized();
        const result = await db_1.db.select().from(schema_1.orders).where((0, drizzle_orm_1.eq)(schema_1.orders.id, id));
        return result[0] || undefined;
    }
    async getAllOrders() {
        await this.ensureInitialized();
        return await db_1.db.select().from(schema_1.orders).orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
    }
    async getOrdersByStatus(status) {
        await this.ensureInitialized();
        return await db_1.db.select().from(schema_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_1.orders.status, status))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
    }
    async getOrdersByLocation(locationId) {
        await this.ensureInitialized();
        return await db_1.db.select().from(schema_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_1.orders.locationId, locationId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
    }
    async updateOrderStatus(id, status) {
        await this.ensureInitialized();
        // Get the current order first to check if it has a table
        const currentOrderResult = await db_1.db.select().from(schema_1.orders).where((0, drizzle_orm_1.eq)(schema_1.orders.id, id));
        const currentOrder = currentOrderResult[0];
        const orderResult = await db_1.db.update(schema_1.orders)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.orders.id, id))
            .returning();
        // If the order is completed or cancelled, and it was a dine-in order with a table,
        // mark the table as available again
        if (currentOrder &&
            currentOrder.orderType === 'dine-in' &&
            currentOrder.tableId &&
            (status === 'delivered' || status === 'cancelled')) {
            await db_1.db.update(schema_1.tables)
                .set({ status: 'available' })
                .where((0, drizzle_orm_1.eq)(schema_1.tables.id, currentOrder.tableId));
        }
        return orderResult[0];
    }
    async deleteOrder(id) {
        await this.ensureInitialized();
        // Get the order first to check if it has a table
        const currentOrderResult = await db_1.db.select().from(schema_1.orders).where((0, drizzle_orm_1.eq)(schema_1.orders.id, id));
        const currentOrder = currentOrderResult[0];
        // Delete order items first, then the order
        await db_1.db.delete(schema_1.orderItems).where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, id));
        await db_1.db.delete(schema_1.orders).where((0, drizzle_orm_1.eq)(schema_1.orders.id, id));
        // If it was a dine-in order with a table, mark the table as available again
        if (currentOrder &&
            currentOrder.orderType === 'dine-in' &&
            currentOrder.tableId) {
            await db_1.db.update(schema_1.tables)
                .set({ status: 'available' })
                .where((0, drizzle_orm_1.eq)(schema_1.tables.id, currentOrder.tableId));
        }
    }
    async getOrderItems(orderId) {
        await this.ensureInitialized();
        return await db_1.db.select().from(schema_1.orderItems).where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, orderId));
    }
    // Tables operations
    async getAllTables() {
        await this.ensureInitialized();
        return await db_1.db.select().from(schema_1.tables);
    }
    async getTablesByLocation(locationId) {
        await this.ensureInitialized();
        return await db_1.db.select().from(schema_1.tables).where((0, drizzle_orm_1.eq)(schema_1.tables.locationId, locationId));
    }
    async getTable(id) {
        await this.ensureInitialized();
        const result = await db_1.db.select().from(schema_1.tables).where((0, drizzle_orm_1.eq)(schema_1.tables.id, id));
        return result[0] || undefined;
    }
    async createTable(insertTable) {
        await this.ensureInitialized();
        console.log(`🔍 Verificando duplicação para mesa ${insertTable.tableNumber} no local ${insertTable.locationId}`);
        // Verificar se já existe uma mesa com o mesmo número no mesmo local
        const existingTable = await db_1.db.select().from(schema_1.tables).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tables.locationId, insertTable.locationId), (0, drizzle_orm_1.eq)(schema_1.tables.tableNumber, insertTable.tableNumber)));
        console.log(`🔍 Mesa existente encontrada:`, existingTable[0]);
        if (existingTable.length > 0) {
            throw new Error(`Já existe uma mesa número ${insertTable.tableNumber} no local ${insertTable.locationId}`);
        }
        const result = await db_1.db.insert(schema_1.tables).values(insertTable).returning();
        return result[0];
    }
    async updateTable(id, updates) {
        await this.ensureInitialized();
        // Se está atualizando o número ou localização, verificar duplicação
        if (updates.tableNumber !== undefined || updates.locationId !== undefined) {
            // Buscar a mesa atual para obter os dados completos
            const currentTable = await this.getTable(id);
            if (!currentTable) {
                throw new Error('Mesa não encontrada');
            }
            const newNumber = updates.tableNumber !== undefined ? updates.tableNumber : currentTable.tableNumber;
            const newLocationId = updates.locationId !== undefined ? updates.locationId : currentTable.locationId;
            // Verificar se existe outra mesa com o mesmo número no mesmo local
            const existingTable = await db_1.db.select().from(schema_1.tables).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tables.locationId, newLocationId), (0, drizzle_orm_1.eq)(schema_1.tables.tableNumber, newNumber), (0, drizzle_orm_1.eq)(schema_1.tables.id, id) // Excluir a mesa atual da verificação
            ));
            if (existingTable.length > 0 && existingTable[0].id !== id) {
                throw new Error(`Já existe uma mesa número ${newNumber} no local ${newLocationId}`);
            }
        }
        const result = await db_1.db.update(schema_1.tables)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(schema_1.tables.id, id))
            .returning();
        return result[0];
    }
    async deleteTable(id) {
        await this.ensureInitialized();
        await db_1.db.delete(schema_1.tables).where((0, drizzle_orm_1.eq)(schema_1.tables.id, id));
    }
    async updateTableStatus(id, status) {
        await this.ensureInitialized();
        const result = await db_1.db.update(schema_1.tables)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.tables.id, id))
            .returning();
        return result[0];
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
