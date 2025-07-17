import { type VercelRequest, type VercelResponse } from "@vercel/node";
import { storage } from "./lib/storage";
import { requireAuth, type AuthenticatedRequest } from "./lib/auth";
import { autoInitialize } from "./lib/sample-data";
import { z } from "zod";

const orderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional(),
  orderType: z.enum(['dine-in', 'takeout', 'delivery']),
  locationId: z.string().min(1),
  tableId: z.number().optional(),
  items: z.array(z.object({
    menuItemId: z.number(),
    quantity: z.number().min(1),
    customizations: z.array(z.string()).default([]),
    unitPrice: z.number().min(0)
  })).min(1),
  notes: z.string().optional(),
  totalAmount: z.number().min(0),
  deliveryAddress: z.string().optional(),
  status: z.string().default('pending'),
  paymentMethod: z.string().default('cash'),
  paymentStatus: z.string().default('pending'),
  estimatedDeliveryTime: z.number().default(30)
});

const reservationSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  date: z.string(),
  time: z.string(),
  guests: z.number().min(1),
  notes: z.string().optional()
});

const contactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  message: z.string().min(1)
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, body, query } = req;
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ORDER ENDPOINTS
    if (req.url?.includes('/orders')) {
      if (method === 'GET' && query.id) {
        const id = parseInt(query.id as string);
        const order = await storage.getOrder(id);
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
        return res.status(200).json(order);
      }

      if (method === 'GET') {
        const orders = await storage.getAllOrders();
        return res.status(200).json(orders);
      }

      if (method === 'POST') {
        const validatedData = orderSchema.parse(body);
        const { items, ...orderData } = validatedData;
        const newOrder = await storage.createOrder(orderData as any, items as any);
        return res.status(201).json(newOrder);
      }

      if (method === 'PUT' && query.id) {
        const id = parseInt(query.id as string);
        const { status } = body;
        const updatedOrder = await storage.updateOrderStatus(id, status);
        return res.status(200).json(updatedOrder);
      }

      if (method === 'DELETE' && query.id) {
        const id = parseInt(query.id as string);
        await storage.deleteOrder(id);
        return res.status(204).end();
      }
    }

    // RESERVATION ENDPOINTS
    if (req.url?.includes('/reservations')) {
      if (method === 'GET') {
        const reservations = await storage.getAllReservations();
        return res.status(200).json(reservations);
      }

      if (method === 'POST') {
        const validatedData = reservationSchema.parse(body);
        const newReservation = await storage.createReservation(validatedData as any);
        return res.status(201).json(newReservation);
      }
    }

    // CONTACT ENDPOINTS
    if (req.url?.includes('/contacts')) {
      if (method === 'POST') {
        const validatedData = contactSchema.parse(body);
        const newContact = await storage.createContact(validatedData as any);
        return res.status(201).json(newContact);
      }
    }

    // AVAILABILITY ENDPOINT
    if (req.url?.includes('/availability')) {
      if (method === 'GET') {
        const { date, time } = query;
        if (!date || !time) {
          return res.status(400).json({ error: "Date and time are required" });
        }
        const available = await storage.checkAvailability(date as string, time as string);
        return res.status(200).json({ available });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error('Restaurant API error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}