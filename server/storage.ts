import type {
  Reservation,
  InsertReservation,
  Contact,
  InsertContact,
  MenuItem,
  InsertMenuItem,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  Table,
  InsertTable,
} from "@shared/schema";

export interface IStorage {
  // Reservations
  getReservations(): Promise<Reservation[]>;
  createReservation(data: InsertReservation): Promise<Reservation>;

  // Contacts
  getContacts(): Promise<Contact[]>;
  createContact(data: InsertContact): Promise<Contact>;

  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  createMenuItem(data: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, data: Partial<MenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;

  // Orders
  getOrders(): Promise<Order[]>;
  createOrder(orderData: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order>;
  deleteOrder(id: number): Promise<void>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Tables
  getTables(): Promise<Table[]>;
  createTable(data: InsertTable): Promise<Table>;
  updateTable(id: number, data: Partial<Table>): Promise<Table>;
  getAvailableTables(locationId: string): Promise<Table[]>;
}

class MemStorage implements IStorage {
  private reservations: Reservation[] = [];
  private contacts: Contact[] = [];
  private menuItems: MenuItem[] = [];
  private orders: Order[] = [];
  private orderItems: OrderItem[] = [];
  private tables: Table[] = [];
  private nextReservationId = 1;
  private nextContactId = 1;
  private nextMenuItemId = 1;
  private nextOrderId = 1;
  private nextOrderItemId = 1;
  private nextTableId = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample menu items
    const sampleMenuItems: MenuItem[] = [
      {
        id: this.nextMenuItemId++,
        name: "Tacos de Carnitas",
        description: "Tacos tradicionais mexicanos com carne de porco desfiada, cebola e coentro",
        price: "1500",
        category: "Tacos",
        image: "/images/tacos-carnitas.jpg",
        available: true,
        preparationTime: 15,
        customizations: ["sem cebola", "extra coentro", "picante"],
        createdAt: new Date(),
      },
      {
        id: this.nextMenuItemId++,
        name: "Quesadilla de Queijo",
        description: "Tortilla de farinha recheada com queijo derretido e servida com molho",
        price: "1200",
        category: "Quesadillas",
        image: "/images/quesadilla.jpg",
        available: true,
        preparationTime: 10,
        customizations: ["extra queijo", "com guacamole"],
        createdAt: new Date(),
      },
    ];

    // Sample tables
    const sampleTables: Table[] = [
      {
        id: this.nextTableId++,
        number: 1,
        locationId: "ilha",
        capacity: 4,
        status: "available",
        position: "janela",
        features: ["ar_condicionado", "vista_mar"],
        notes: "Mesa com vista para o mar",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.nextTableId++,
        number: 2,
        locationId: "talatona",
        capacity: 6,
        status: "available",
        position: "centro",
        features: ["ar_condicionado", "kids_area"],
        notes: "Mesa próxima à área infantil",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.menuItems = sampleMenuItems;
    this.tables = sampleTables;
  }

  // Reservations
  async getReservations(): Promise<Reservation[]> {
    return this.reservations;
  }

  async createReservation(data: InsertReservation): Promise<Reservation> {
    const reservation: Reservation = {
      id: this.nextReservationId++,
      ...data,
      createdAt: new Date(),
    };
    this.reservations.push(reservation);
    return reservation;
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return this.contacts;
  }

  async createContact(data: InsertContact): Promise<Contact> {
    const contact: Contact = {
      id: this.nextContactId++,
      ...data,
      createdAt: new Date(),
    };
    this.contacts.push(contact);
    return contact;
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    return this.menuItems;
  }

  async createMenuItem(data: InsertMenuItem): Promise<MenuItem> {
    const menuItem: MenuItem = {
      id: this.nextMenuItemId++,
      ...data,
      createdAt: new Date(),
    };
    this.menuItems.push(menuItem);
    return menuItem;
  }

  async updateMenuItem(id: number, data: Partial<MenuItem>): Promise<MenuItem> {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error("Menu item not found");
    }
    this.menuItems[index] = { ...this.menuItems[index], ...data };
    return this.menuItems[index];
  }

  async deleteMenuItem(id: number): Promise<void> {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error("Menu item not found");
    }
    this.menuItems.splice(index, 1);
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return this.orders;
  }

  async createOrder(orderData: InsertOrder, orderItemsData: InsertOrderItem[]): Promise<Order> {
    const order: Order = {
      id: this.nextOrderId++,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.push(order);

    // Create order items
    for (const itemData of orderItemsData) {
      const orderItem: OrderItem = {
        id: this.nextOrderItemId++,
        orderId: order.id,
        ...itemData,
      };
      this.orderItems.push(orderItem);
    }

    // Update table status if dine-in order
    if (order.tableId && order.orderType === "dine-in") {
      await this.updateTable(order.tableId, { status: "occupied" });
    }

    return order;
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order> {
    const index = this.orders.findIndex(order => order.id === id);
    if (index === -1) {
      throw new Error("Order not found");
    }

    const currentOrder = this.orders[index];
    this.orders[index] = { 
      ...currentOrder, 
      ...data, 
      updatedAt: new Date() 
    };

    // Handle table status updates
    if (data.status === "delivered" || data.status === "cancelled") {
      if (currentOrder.tableId && currentOrder.orderType === "dine-in") {
        await this.updateTable(currentOrder.tableId, { status: "available" });
      }
    }

    return this.orders[index];
  }

  async deleteOrder(id: number): Promise<void> {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      throw new Error("Order not found");
    }

    const order = this.orders[orderIndex];

    // Free up table if it was a dine-in order
    if (order.tableId && order.orderType === "dine-in") {
      await this.updateTable(order.tableId, { status: "available" });
    }

    // Remove order and its items
    this.orders.splice(orderIndex, 1);
    this.orderItems = this.orderItems.filter(item => item.orderId !== id);
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.orderItems.filter(item => item.orderId === orderId);
  }

  // Tables
  async getTables(): Promise<Table[]> {
    return this.tables;
  }

  async createTable(data: InsertTable): Promise<Table> {
    const table: Table = {
      id: this.nextTableId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tables.push(table);
    return table;
  }

  async updateTable(id: number, data: Partial<Table>): Promise<Table> {
    const index = this.tables.findIndex(table => table.id === id);
    if (index === -1) {
      throw new Error("Table not found");
    }
    this.tables[index] = { 
      ...this.tables[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return this.tables[index];
  }

  async getAvailableTables(locationId: string): Promise<Table[]> {
    return this.tables.filter(
      table => table.locationId === locationId && table.status === "available"
    );
  }
}

export const storage: IStorage = new MemStorage();