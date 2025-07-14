import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { status, locationId } = req.query;
        let orders;
        
        if (status) {
          orders = await storage.getOrdersByStatus(status as string);
        } else if (locationId) {
          orders = await storage.getOrdersByLocation(locationId as string);
        } else {
          orders = await storage.getAllOrders();
        }
        
        return res.json(orders);
      }

      case 'POST': {
        const { items, ...orderData } = req.body;
        const order = await storage.createOrder(orderData, items);
        return res.status(201).json(order);
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}