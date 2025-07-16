import { 
  type Reservation, type InsertReservation, 
  type Contact, type InsertContact, type MenuItem, type InsertMenuItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Table, type InsertTable
} from "../shared/prisma-types";
import { prisma } from "./db";

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
      const existingItems = await prisma.menuItem.findMany();
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
            customizations: []
          },
          {
            name: 'Burrito Supremo',
            description: 'Burrito gigante com carne, feijão, arroz, queijo e molho especial',
            price: 3200,
            category: 'Burritos',
            image: '/api/placeholder/400/300',
            available: true,
            customizations: []
          },
          {
            name: 'Quesadilla de Queijo',
            description: 'Tortilla crocante recheada com queijo derretido e temperos',
            price: 2000,
            category: 'Quesadillas',
            image: '/api/placeholder/400/300',
            available: true,
            customizations: []
          },
          {
            name: 'Nachos Especiais',
            description: 'Chips de tortilla com queijo derretido, guacamole e molho picante',
            price: 2800,
            category: 'Aperitivos',
            image: '/api/placeholder/400/300',
            available: true,
            customizations: []
          },
          {
            name: 'Enchiladas Verdes',
            description: 'Tortillas recheadas com frango e cobertas com molho verde',
            price: 3000,
            category: 'Enchiladas',
            image: '/api/placeholder/400/300',
            available: true,
            customizations: []
          },
          {
            name: 'Fajitas de Frango',
            description: 'Frango grelhado com pimentos e cebolas, servido com tortillas',
            price: 3500,
            category: 'Fajitas',
            image: '/api/placeholder/400/300',
            available: true,
            customizations: []
          }
        ];

        await prisma.menuItem.createMany({
          data: sampleItems
        });
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
    return await prisma.reservation.create({
      data: insertReservation
    });
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    await this.ensureInitialized();
    return await prisma.contact.create({
      data: insertContact
    });
  }

  async getAllReservations(): Promise<Reservation[]> {
    await this.ensureInitialized();
    return await prisma.reservation.findMany();
  }

  async checkAvailability(date: string, time: string): Promise<boolean> {
    await this.ensureInitialized();
    const existing = await prisma.reservation.findFirst({
      where: {
        date: date,
        time: time
      }
    });
    return existing === null;
  }

  async getReservationsByDate(date: string): Promise<Reservation[]> {
    await this.ensureInitialized();
    return await prisma.reservation.findMany({
      where: {
        date: date
      }
    });
  }

  // Menu Items
  async getAllMenuItems(): Promise<MenuItem[]> {
    await this.ensureInitialized();
    return await prisma.menuItem.findMany();
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    await this.ensureInitialized();
    return await prisma.menuItem.findMany({
      where: {
        category: category
      }
    });
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    await this.ensureInitialized();
    return await prisma.menuItem.findUnique({
      where: {
        id: id
      }
    }) || undefined;
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    await this.ensureInitialized();
    return await prisma.menuItem.create({
      data: insertItem
    });
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    await this.ensureInitialized();
    // Remove campos que não devem ser atualizados manualmente
    const { id: itemId, createdAt, ...validUpdates } = updates;
    
    return await prisma.menuItem.update({
      where: {
        id: id
      },
      data: validUpdates
    });
  }

  async deleteMenuItem(id: number): Promise<void> {
    await this.ensureInitialized();
    await prisma.menuItem.delete({
      where: {
        id: id
      }
    });
  }

  // Orders
  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    await this.ensureInitialized();
    
    // Create order with transaction
    const order = await prisma.order.create({
      data: {
        ...insertOrder,
        items: {
          create: items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            customizations: item.customizations
          }))
        }
      },
      include: {
        items: true
      }
    });
    
    // If it's a dine-in order with a table, mark the table as occupied
    if (order.orderType === 'dine-in' && order.tableId) {
      console.log(`Marking table ${order.tableId} as occupied for order ${order.id}`);
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'occupied' }
      });
      console.log(`Table ${order.tableId} marked as occupied`);
    } else {
      console.log(`Order ${order.id} - orderType: ${order.orderType}, tableId: ${order.tableId}`);
    }
    
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    await this.ensureInitialized();
    return await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    }) || undefined;
  }

  async getAllOrders(): Promise<Order[]> {
    await this.ensureInitialized();
    return await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    await this.ensureInitialized();
    return await prisma.order.findMany({
      where: { status },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getOrdersByLocation(locationId: string): Promise<Order[]> {
    await this.ensureInitialized();
    return await prisma.order.findMany({
      where: { locationId },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    await this.ensureInitialized();
    
    // Get the current order first to check if it has a table
    const currentOrder = await prisma.order.findUnique({
      where: { id }
    });

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // If the order is completed or cancelled, and it was a dine-in order with a table,
    // mark the table as available again
    if (currentOrder && 
        currentOrder.orderType === 'dine-in' && 
        currentOrder.tableId && 
        (status === 'delivered' || status === 'cancelled')) {
      await prisma.table.update({
        where: { id: currentOrder.tableId },
        data: { status: 'available' }
      });
    }

    return order;
  }

  async deleteOrder(id: number): Promise<void> {
    await this.ensureInitialized();
    
    // Get the order first to check if it has a table
    const currentOrder = await prisma.order.findUnique({
      where: { id }
    });

    // Delete the order (order items will be deleted automatically due to cascade)
    await prisma.order.delete({
      where: { id }
    });

    // If it was a dine-in order with a table, mark the table as available again
    if (currentOrder && 
        currentOrder.orderType === 'dine-in' && 
        currentOrder.tableId) {
      await prisma.table.update({
        where: { id: currentOrder.tableId },
        data: { status: 'available' }
      });
    }
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    await this.ensureInitialized();
    return await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        menuItem: true
      }
    });
  }

  // Tables operations
  async getAllTables(): Promise<Table[]> {
    await this.ensureInitialized();
    return await prisma.table.findMany();
  }

  async getTablesByLocation(locationId: string): Promise<Table[]> {
    await this.ensureInitialized();
    return await prisma.table.findMany({
      where: { locationId }
    });
  }

  async getTable(id: number): Promise<Table | undefined> {
    await this.ensureInitialized();
    return await prisma.table.findUnique({
      where: { id }
    }) || undefined;
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    await this.ensureInitialized();
    
    console.log(`🔍 Verificando duplicação para mesa ${insertTable.tableNumber} no local ${insertTable.locationId}`);
    
    // Verificar se já existe uma mesa com o mesmo número no mesmo local
    const existingTable = await prisma.table.findFirst({
      where: {
        locationId: insertTable.locationId,
        tableNumber: insertTable.tableNumber
      }
    });
    
    console.log(`🔍 Mesa existente encontrada:`, existingTable);
    
    if (existingTable) {
      throw new Error(`Já existe uma mesa número ${insertTable.tableNumber} no local ${insertTable.locationId}`);
    }
    
    return await prisma.table.create({
      data: insertTable
    });
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
      const existingTable = await prisma.table.findFirst({
        where: {
          locationId: newLocationId,
          tableNumber: newNumber,
          NOT: { id: id } // Excluir a mesa atual da verificação
        }
      });
      
      if (existingTable) {
        throw new Error(`Já existe uma mesa número ${newNumber} no local ${newLocationId}`);
      }
    }
    
    return await prisma.table.update({
      where: { id },
      data: updates
    });
  }

  async deleteTable(id: number): Promise<void> {
    await this.ensureInitialized();
    await prisma.table.delete({
      where: { id }
    });
  }

  async updateTableStatus(id: number, status: string): Promise<Table> {
    await this.ensureInitialized();
    return await prisma.table.update({
      where: { id },
      data: { status }
    });
  }
}

export const storage = new DatabaseStorage();