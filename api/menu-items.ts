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
        const { category } = req.query;
        const items = category 
          ? await storage.getMenuItemsByCategory(category as string)
          : await storage.getAllMenuItems();
        return res.json(items);
      }

      case 'POST': {
        const item = await storage.createMenuItem(req.body);
        return res.status(201).json(item);
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Menu items API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}