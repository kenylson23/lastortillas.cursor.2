import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../server/db';
import { orders, insertOrderSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const allOrders = await db.select().from(orders);
      return res.status(200).json(allOrders);
    }

    if (req.method === 'POST') {
      const validatedData = insertOrderSchema.parse(req.body);
      const newOrder = await db.insert(orders).values([validatedData]).returning();
      return res.status(201).json(newOrder[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in orders API:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
}