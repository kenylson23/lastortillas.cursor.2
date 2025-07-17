import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertOrderSchema, insertOrderItemSchema } from '../shared/schema';
import { z } from 'zod';

const createOrderSchema = z.object({
  order: insertOrderSchema,
  items: z.array(insertOrderItemSchema)
});

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method === 'POST') {
    try {
      const { order, items } = createOrderSchema.parse(request.body);
      const createdOrder = await storage.createOrder(order, items);
      
      response.status(201).json(createdOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      response.status(400).json({ error: 'Invalid order data' });
    }
  } else if (request.method === 'GET') {
    try {
      const orders = await storage.getAllOrders();
      response.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  } else {
    response.status(405).json({ message: 'Method Not Allowed' });
  }
}