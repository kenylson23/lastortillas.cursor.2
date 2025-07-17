import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../server/db';
import { tables } from '../shared/schema';

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
      const allTables = await db.select().from(tables);
      return res.status(200).json(allTables);
    }

    if (req.method === 'POST') {
      const newTable = await db.insert(tables).values([req.body]).returning();
      return res.status(201).json(newTable[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in tables API:', error);
    return res.status(500).json({ error: error.message });
  }
}