import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const tableId = parseInt(id as string);

  if (isNaN(tableId)) {
    return res.status(400).json({ message: 'Invalid table ID' });
  }

  try {
    switch (req.method) {
      case 'PUT': {
        const { status } = req.body;
        if (!status) {
          return res.status(400).json({ message: 'Status is required' });
        }
        
        const table = await storage.updateTableStatus(tableId, status);
        return res.json(table);
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Table status API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}