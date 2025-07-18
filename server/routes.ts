import { storage } from "./storage";
import { insertReservationSchema, insertContactSchema, insertOrderSchema, insertOrderItemSchema, insertMenuItemSchema, insertTableSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Cache otimizado para verificação de disponibilidade
const availabilityCache = new Map<string, { available: boolean; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 segundos para dados mais atualizados

// Cache para resultados de reservas por data
const reservationsCache = new Map<string, { data: any[]; timestamp: number }>();
const RESERVATIONS_CACHE_DURATION = 30 * 1000; // 30 segundos

// Função para limpar cache expirado
function cleanExpiredCache() {
  const now = Date.now();
  
  // Limpar cache de disponibilidade
  for (const [key, value] of availabilityCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      availabilityCache.delete(key);
    }
  }
  
  // Limpar cache de reservas
  for (const [key, value] of reservationsCache.entries()) {
    if (now - value.timestamp > RESERVATIONS_CACHE_DURATION) {
      reservationsCache.delete(key);
    }
  }
}

// Executar limpeza do cache a cada 30 segundos
setInterval(cleanExpiredCache, 30 * 1000);

// Configurar multer para upload de arquivos
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

// API Functions - Without Express dependencies

// Check availability
export async function checkAvailability(date: string, time: string) {
  const cacheKey = `${date}-${time}`;
  const cached = availabilityCache.get(cacheKey);
  const now = Date.now();
  
  // Verificar se cache é válido
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return { available: cached.available, cached: true };
  }
  
  const isAvailable = await storage.checkAvailability(date, time);
  
  // Armazenar no cache
  availabilityCache.set(cacheKey, { available: isAvailable, timestamp: now });
  
  return { available: isAvailable, cached: false };
}

// Create reservation
export async function createReservation(reservationData: any) {
  const reservation = insertReservationSchema.parse(reservationData);
  const newReservation = await storage.createReservation(reservation);
  
  // Limpar cache após criação de reserva
  const cacheKey = `${reservation.date}-${reservation.time}`;
  availabilityCache.delete(cacheKey);
  
  // Limpar cache de reservas para a data
  const reservationsCacheKey = `reservations-${reservation.date}`;
  reservationsCache.delete(reservationsCacheKey);
  
  return newReservation;
}

// Create contact
export async function createContact(contactData: any) {
  const contact = insertContactSchema.parse(contactData);
  const newContact = await storage.createContact(contact);
  return newContact;
}

// Get reservations by date
export async function getReservationsByDate(date: string) {
  const cacheKey = `reservations-${date}`;
  const cached = reservationsCache.get(cacheKey);
  const now = Date.now();
  
  // Verificar se cache é válido
  if (cached && (now - cached.timestamp) < RESERVATIONS_CACHE_DURATION) {
    return cached.data;
  }
  
  const reservations = await storage.getReservationsByDate(date);
  
  // Armazenar no cache
  reservationsCache.set(cacheKey, { data: reservations, timestamp: now });
  
  return reservations;
}

// Get all reservations
export async function getAllReservations() {
  return await storage.getAllReservations();
}

// Menu Items functions
export async function getAllMenuItems() {
  return await storage.getAllMenuItems();
}

export async function createMenuItem(itemData: any) {
  const validatedItem = insertMenuItemSchema.parse(itemData);
  return await storage.createMenuItem(validatedItem);
}

export async function updateMenuItem(id: number, updates: any) {
  // Validar dados essenciais
  if (updates.name && typeof updates.name !== 'string') {
    throw new Error("Nome deve ser uma string");
  }
  if (updates.price && typeof updates.price !== 'string') {
    throw new Error("Preço deve ser uma string");
  }
  if (updates.category && typeof updates.category !== 'string') {
    throw new Error("Categoria deve ser uma string");
  }
  
  return await storage.updateMenuItem(id, updates);
}

export async function deleteMenuItem(id: number) {
  // Verificar se o item existe
  const existingItem = await storage.getMenuItem(id);
  if (!existingItem) {
    throw new Error("Item não encontrado");
  }
  
  return await storage.deleteMenuItem(id);
}

export async function getMenuItemsByCategory(category: string) {
  return await storage.getMenuItemsByCategory(category);
}

export async function getMenuItem(id: number) {
  return await storage.getMenuItem(id);
}

// Orders functions
export async function createOrder(orderData: any, itemsData: any[]) {
  const validatedOrder = insertOrderSchema.parse(orderData);
  const validatedItems = itemsData.map(item => insertOrderItemSchema.parse(item));
  
  return await storage.createOrder(validatedOrder, validatedItems);
}

export async function updateOrderStatus(id: number, status: string) {
  if (!['received', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
    throw new Error("Invalid status");
  }
  
  return await storage.updateOrderStatus(id, status);
}

export async function getAllOrders() {
  return await storage.getAllOrders();
}

export async function getOrdersByStatus(status: string) {
  return await storage.getOrdersByStatus(status);
}

export async function getOrdersByLocation(location: string) {
  return await storage.getOrdersByLocation(location);
}

export async function getOrder(id: number) {
  return await storage.getOrder(id);
}

export async function getOrderItems(id: number) {
  return await storage.getOrderItems(id);
}

export async function deleteOrder(id: number) {
  // Verificar se o pedido existe
  const existingOrder = await storage.getOrder(id);
  if (!existingOrder) {
    throw new Error("Pedido não encontrado");
  }
  
  return await storage.deleteOrder(id);
}

// Tables functions
export async function getAllTables() {
  return await storage.getAllTables();
}

export async function getTablesByLocation(location: string) {
  return await storage.getTablesByLocation(location);
}

export async function getTable(id: number) {
  return await storage.getTable(id);
}

export async function createTable(tableData: any) {
  const validatedData = insertTableSchema.parse(tableData);
  return await storage.createTable(validatedData);
}

export async function updateTable(id: number, updates: any) {
  const existingTable = await storage.getTable(id);
  if (!existingTable) {
    throw new Error("Mesa não encontrada");
  }
  
  return await storage.updateTable(id, updates);
}

export async function updateTableStatus(id: number, status: string) {
  if (!['available', 'occupied', 'reserved', 'maintenance'].includes(status)) {
    throw new Error("Status inválido");
  }
  
  return await storage.updateTableStatus(id, status);
}

export async function deleteTable(id: number) {
  const existingTable = await storage.getTable(id);
  if (!existingTable) {
    throw new Error("Mesa não encontrada");
  }
  
  return await storage.deleteTable(id);
}

// File upload function
export function setupFileUpload() {
  return upload;
}

// Utility functions
export function generatePlaceholderImage(width: number, height: number) {
  return `https://via.placeholder.com/${width}x${height}/ff6b35/ffffff?text=Las+Tortillas`;
}

export { upload };