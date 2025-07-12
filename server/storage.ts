import { 
  reservations, contacts, menuItems, orders, orderItems,
  type Reservation, type InsertReservation, 
  type Contact, type InsertContact, type MenuItem, type InsertMenuItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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
  
  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getOrdersByLocation(locationId: string): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
}

export class DatabaseStorage implements IStorage {
  
  constructor() {
    this.initializeSampleMenuItems();
  }

  private async initializeSampleMenuItems(): Promise<void> {
    try {
      // Check if menu items already exist
      const existingItems = await this.getAllMenuItems();
      if (existingItems.length === 0) {
        // Add sample menu items
        const sampleItems = [
          {
            name: 'Tacos al Pastor',
            description: 'Tacos tradicionais com carne de porco marinada, abacaxi e coentro',
            price: '2500',
            category: 'Tacos',
            image: '/api/placeholder/400/300',
            available: true
          },
          {
            name: 'Burrito Supremo',
            description: 'Burrito gigante com carne, feijão, arroz, queijo e molho especial',
            price: '3200',
            category: 'Burritos',
            image: '/api/placeholder/400/300',
            available: true
          },
          {
            name: 'Quesadilla de Queijo',
            description: 'Tortilla crocante recheada com queijo derretido e temperos',
            price: '2000',
            category: 'Quesadillas',
            image: '/api/placeholder/400/300',
            available: true
          },
          {
            name: 'Nachos Especiais',
            description: 'Chips de tortilla com queijo derretido, guacamole e molho picante',
            price: '2800',
            category: 'Aperitivos',
            image: '/api/placeholder/400/300',
            available: true
          },
          {
            name: 'Enchiladas Verdes',
            description: 'Tortillas recheadas com frango e cobertas com molho verde',
            price: '3000',
            category: 'Enchiladas',
            image: '/api/placeholder/400/300',
            available: true
          },
          {
            name: 'Fajitas de Frango',
            description: 'Frango grelhado com pimentos e cebolas, servido com tortillas',
            price: '3500',
            category: 'Fajitas',
            image: '/api/placeholder/400/300',
            available: true
          }
        ];

        for (const item of sampleItems) {
          await this.createMenuItem(item);
        }
        console.log('Sample menu items initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing sample menu items:', error);
    }
  }
  // Reservation operations
  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const [reservation] = await db
      .insert(reservations)
      .values(insertReservation)
      .returning();
    return reservation;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getAllReservations(): Promise<Reservation[]> {
    return await db.select().from(reservations);
  }

  async checkAvailability(date: string, time: string): Promise<boolean> {
    const existing = await db
      .select()
      .from(reservations)
      .where(and(eq(reservations.date, date), eq(reservations.time, time)));
    return existing.length === 0;
  }

  async getReservationsByDate(date: string): Promise<Reservation[]> {
    return await db
      .select()
      .from(reservations)
      .where(eq(reservations.date, date));
  }

  // Menu Items
  async getAllMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems);
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.category, category));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const [item] = await db
      .insert(menuItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    const [item] = await db
      .update(menuItems)
      .set(updates)
      .where(eq(menuItems.id, id))
      .returning();
    return item;
  }

  // Orders
  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    
    // Create order items
    await db.insert(orderItems).values(
      items.map(item => ({ ...item, orderId: order.id }))
    );
    
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.status, status));
  }

  async getOrdersByLocation(locationId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.locationId, locationId));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }
}

export const storage = new DatabaseStorage();