import { db } from './db.js';
import { eq, and, desc } from 'drizzle-orm';
import { users, menuItems, orders, orderItems, reservations, contacts, tables } from '../shared/schema.js';
import type { User, MenuItem, Order, OrderItem, Reservation, Contact, Table, InsertUser, InsertMenuItem, InsertOrder, InsertOrderItem, InsertReservation, InsertContact, InsertTable } from '../shared/schema.js';

export interface IStorage {
  // Reservation operations
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  createContact(contact: InsertContact): Promise<Contact>;
  getAllReservations(): Promise<Reservation[]>;
  checkAvailability(date: string, time: string): Promise<boolean>;
  getReservationsByDate(date: string): Promise<Reservation[]>;
  
  // Menu Items
  getAllMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<MenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;
  
  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getOrdersByLocation(locationId: string): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  deleteOrder(id: number): Promise<void>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // Tables
  getAllTables(): Promise<Table[]>;
  getTablesByLocation(locationId: string): Promise<Table[]>;
  getTable(id: number): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: number, table: Partial<Table>): Promise<Table>;
  deleteTable(id: number): Promise<void>;
  updateTableStatus(id: number, status: string): Promise<Table>;
}

export class DatabaseStorage implements IStorage {
  private initializationPromise: Promise<void> | null = null;
  
  constructor() {
    // Don't initialize in constructor to avoid blocking the app startup
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeSampleMenuItems();
    }
    await this.initializationPromise;
  }

  private async initializeSampleMenuItems(): Promise<void> {
    try {
      // Check if menu items already exist
      const existingItems = await db.select().from(menuItems);
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

        await db.insert(menuItems).values(sampleItems);
        console.log('Sample menu items initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing sample menu items:', error);
      // Don't throw here, let the app continue without sample data
    }
  }
  // Reservation operations
  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    await this.ensureInitialized();
    const result = await db.insert(reservations).values(insertReservation).returning();
    return result[0];
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    await this.ensureInitialized();
    const result = await db.insert(contacts).values(insertContact).returning();
    return result[0];
  }

  async getAllReservations(): Promise<Reservation[]> {
    await this.ensureInitialized();
    return await db.select().from(reservations);
  }

  async checkAvailability(date: string, time: string): Promise<boolean> {
    await this.ensureInitialized();
    const existing = await db.select().from(reservations).where(
      and(eq(reservations.date, date), eq(reservations.time, time))
    );
    return existing.length === 0;
  }

  async getReservationsByDate(date: string): Promise<Reservation[]> {
    await this.ensureInitialized();
    return await db.select().from(reservations).where(eq(reservations.date, date));
  }

  // Menu Items
  async getAllMenuItems(): Promise<MenuItem[]> {
    await this.ensureInitialized();
    return await db.select().from(menuItems);
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    await this.ensureInitialized();
    return await db.select().from(menuItems).where(eq(menuItems.category, category));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    await this.ensureInitialized();
    const result = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return result[0] || undefined;
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    await this.ensureInitialized();
    const result = await db.insert(menuItems).values(insertItem).returning();
    return result[0];
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    await this.ensureInitialized();
    // Remove campos que não devem ser atualizados manualmente
    const { id: itemId, createdAt, ...validUpdates } = updates;
    
    const result = await db.update(menuItems)
      .set(validUpdates)
      .where(eq(menuItems.id, id))
      .returning();
    return result[0];
  }

  async deleteMenuItem(id: number): Promise<void> {
    await this.ensureInitialized();
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Orders
  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    await this.ensureInitialized();
    
    // Create order first
    const orderResult = await db.insert(orders).values(insertOrder).returning();
    const order = orderResult[0];
    
    // Create order items with the order ID
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: order.id
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    // If it's a dine-in order with a table, mark the table as occupied
    if (order.orderType === 'dine-in' && order.tableId) {
      console.log(`Marking table ${order.tableId} as occupied for order ${order.id}`);
      await db.update(tables)
        .set({ status: 'occupied' })
        .where(eq(tables.id, order.tableId));
      console.log(`Table ${order.tableId} marked as occupied`);
    } else {
      console.log(`Order ${order.id} - orderType: ${order.orderType}, tableId: ${order.tableId}`);
    }
    
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    await this.ensureInitialized();
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0] || undefined;
  }

  async getAllOrders(): Promise<Order[]> {
    await this.ensureInitialized();
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    await this.ensureInitialized();
    return await db.select().from(orders)
      .where(eq(orders.status, status))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByLocation(locationId: string): Promise<Order[]> {
    await this.ensureInitialized();
    return await db.select().from(orders)
      .where(eq(orders.locationId, locationId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    await this.ensureInitialized();
    
    // Get the current order first to check if it has a table
    const currentOrderResult = await db.select().from(orders).where(eq(orders.id, id));
    const currentOrder = currentOrderResult[0];

    const orderResult = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();

    // If the order is completed or cancelled, and it was a dine-in order with a table,
    // mark the table as available again
    if (currentOrder && 
        currentOrder.orderType === 'dine-in' && 
        currentOrder.tableId && 
        (status === 'delivered' || status === 'cancelled')) {
      await db.update(tables)
        .set({ status: 'available' })
        .where(eq(tables.id, currentOrder.tableId));
    }

    return orderResult[0];
  }

  async deleteOrder(id: number): Promise<void> {
    await this.ensureInitialized();
    
    // Get the order first to check if it has a table
    const currentOrderResult = await db.select().from(orders).where(eq(orders.id, id));
    const currentOrder = currentOrderResult[0];

    // Delete order items first, then the order
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    await db.delete(orders).where(eq(orders.id, id));

    // If it was a dine-in order with a table, mark the table as available again
    if (currentOrder && 
        currentOrder.orderType === 'dine-in' && 
        currentOrder.tableId) {
      await db.update(tables)
        .set({ status: 'available' })
        .where(eq(tables.id, currentOrder.tableId));
    }
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    await this.ensureInitialized();
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Tables operations
  async getAllTables(): Promise<Table[]> {
    await this.ensureInitialized();
    return await db.select().from(tables);
  }

  async getTablesByLocation(locationId: string): Promise<Table[]> {
    await this.ensureInitialized();
    return await db.select().from(tables).where(eq(tables.locationId, locationId));
  }

  async getTable(id: number): Promise<Table | undefined> {
    await this.ensureInitialized();
    const result = await db.select().from(tables).where(eq(tables.id, id));
    return result[0] || undefined;
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    await this.ensureInitialized();
    
    console.log(`🔍 Verificando duplicação para mesa ${insertTable.tableNumber} no local ${insertTable.locationId}`);
    
    // Verificar se já existe uma mesa com o mesmo número no mesmo local
    const existingTable = await db.select().from(tables).where(
      and(
        eq(tables.locationId, insertTable.locationId),
        eq(tables.tableNumber, insertTable.tableNumber)
      )
    );
    
    console.log(`🔍 Mesa existente encontrada:`, existingTable[0]);
    
    if (existingTable.length > 0) {
      throw new Error(`Já existe uma mesa número ${insertTable.tableNumber} no local ${insertTable.locationId}`);
    }
    
    const result = await db.insert(tables).values(insertTable).returning();
    return result[0];
  }

  async updateTable(id: number, updates: Partial<Table>): Promise<Table> {
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
      const existingTable = await db.select().from(tables).where(
        and(
          eq(tables.locationId, newLocationId),
          eq(tables.tableNumber, newNumber),
          eq(tables.id, id) // Excluir a mesa atual da verificação
        )
      );
      
      if (existingTable.length > 0 && existingTable[0].id !== id) {
        throw new Error(`Já existe uma mesa número ${newNumber} no local ${newLocationId}`);
      }
    }
    
    const result = await db.update(tables)
      .set(updates)
      .where(eq(tables.id, id))
      .returning();
    return result[0];
  }

  async deleteTable(id: number): Promise<void> {
    await this.ensureInitialized();
    await db.delete(tables).where(eq(tables.id, id));
  }

  async updateTableStatus(id: number, status: string): Promise<Table> {
    await this.ensureInitialized();
    const result = await db.update(tables)
      .set({ status })
      .where(eq(tables.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();