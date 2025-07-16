"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const storage_1 = require("../server/storage");
const zod_1 = require("zod");
const orderSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1),
    customerPhone: zod_1.z.string().min(1),
    customerEmail: zod_1.z.string().email().optional(),
    orderType: zod_1.z.enum(['dine-in', 'takeout', 'delivery']),
    locationId: zod_1.z.string().min(1),
    tableId: zod_1.z.number().optional(),
    items: zod_1.z.array(zod_1.z.object({
        menuItemId: zod_1.z.number(),
        quantity: zod_1.z.number().min(1),
        customizations: zod_1.z.array(zod_1.z.string()).default([]),
        unitPrice: zod_1.z.number().min(0)
    })).min(1),
    notes: zod_1.z.string().optional(),
    totalAmount: zod_1.z.number().min(0),
    deliveryAddress: zod_1.z.string().optional(),
    status: zod_1.z.string().default('pending'),
    paymentMethod: zod_1.z.string().default('cash'),
    paymentStatus: zod_1.z.string().default('pending'),
    estimatedDeliveryTime: zod_1.z.number().default(30)
});
const reservationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    date: zod_1.z.string(),
    time: zod_1.z.string(),
    guests: zod_1.z.number().min(1),
    notes: zod_1.z.string().optional()
});
const contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    message: zod_1.z.string().min(1)
});
async function handler(req, res) {
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
                const id = parseInt(query.id);
                const order = await storage_1.storage.getOrder(id);
                if (!order) {
                    return res.status(404).json({ error: "Order not found" });
                }
                return res.status(200).json(order);
            }
            if (method === 'GET') {
                const orders = await storage_1.storage.getAllOrders();
                return res.status(200).json(orders);
            }
            if (method === 'POST') {
                const validatedData = orderSchema.parse(body);
                const { items, ...orderData } = validatedData;
                const newOrder = await storage_1.storage.createOrder(orderData, items);
                return res.status(201).json(newOrder);
            }
            if (method === 'PUT' && query.id) {
                const id = parseInt(query.id);
                const { status } = body;
                const updatedOrder = await storage_1.storage.updateOrderStatus(id, status);
                return res.status(200).json(updatedOrder);
            }
            if (method === 'DELETE' && query.id) {
                const id = parseInt(query.id);
                await storage_1.storage.deleteOrder(id);
                return res.status(204).end();
            }
        }
        // RESERVATION ENDPOINTS
        if (req.url?.includes('/reservations')) {
            if (method === 'GET') {
                const reservations = await storage_1.storage.getAllReservations();
                return res.status(200).json(reservations);
            }
            if (method === 'POST') {
                const validatedData = reservationSchema.parse(body);
                const newReservation = await storage_1.storage.createReservation(validatedData);
                return res.status(201).json(newReservation);
            }
        }
        // CONTACT ENDPOINTS
        if (req.url?.includes('/contacts')) {
            if (method === 'POST') {
                const validatedData = contactSchema.parse(body);
                const newContact = await storage_1.storage.createContact(validatedData);
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
                const available = await storage_1.storage.checkAvailability(date, time);
                return res.status(200).json({ available });
            }
        }
        return res.status(405).json({ error: "Method not allowed" });
    }
    catch (error) {
        console.error('Restaurant API error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
