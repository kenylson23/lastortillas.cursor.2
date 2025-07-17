// Prisma types for the application
export type {
  User,
  Reservation,
  Contact,
  MenuItem,
  Order,
  OrderItem,
  Table,
  Session,
} from '@prisma/client';

// Create types for database operations
export type InsertUser = Omit<import('@prisma/client').User, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertReservation = Omit<import('@prisma/client').Reservation, 'id' | 'createdAt'>;
export type InsertContact = Omit<import('@prisma/client').Contact, 'id' | 'createdAt'>;
export type InsertMenuItem = Omit<import('@prisma/client').MenuItem, 'id' | 'createdAt'>;
export type InsertOrder = Omit<import('@prisma/client').Order, 'id' | 'createdAt'>;
export type InsertOrderItem = Omit<import('@prisma/client').OrderItem, 'id' | 'createdAt'>;
export type InsertTable = Omit<import('@prisma/client').Table, 'id' | 'createdAt'>;

// Extended types for orders with items
export type OrderWithItems = import('@prisma/client').Order & {
  items: import('@prisma/client').OrderItem[];
};

export type OrderItemWithMenuItem = import('@prisma/client').OrderItem & {
  menuItem: import('@prisma/client').MenuItem;
};