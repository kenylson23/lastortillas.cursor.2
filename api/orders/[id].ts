import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const orderId = parseInt(id as string);

  if (isNaN(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const order = await storage.getOrder(orderId);
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        
        const items = await storage.getOrderItems(orderId);
        return res.json({ ...order, items });
      }

      case 'DELETE': {
        await storage.deleteOrder(orderId);
        return res.status(204).end();
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Order API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}