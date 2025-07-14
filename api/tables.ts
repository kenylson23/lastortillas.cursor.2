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
        const { locationId } = req.query;
        const tables = locationId 
          ? await storage.getTablesByLocation(locationId as string)
          : await storage.getAllTables();
        return res.json(tables);
      }

      case 'POST': {
        const table = await storage.createTable(req.body);
        return res.status(201).json(table);
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Tables API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}