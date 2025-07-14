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
  const itemId = parseInt(id as string);

  if (isNaN(itemId)) {
    return res.status(400).json({ message: 'Invalid item ID' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const item = await storage.getMenuItem(itemId);
        if (!item) {
          return res.status(404).json({ message: 'Menu item not found' });
        }
        return res.json(item);
      }

      case 'PUT': {
        const item = await storage.updateMenuItem(itemId, req.body);
        return res.json(item);
      }

      case 'DELETE': {
        await storage.deleteMenuItem(itemId);
        return res.status(204).end();
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Menu item API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}