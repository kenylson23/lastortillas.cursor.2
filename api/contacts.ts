import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../server/db';
import { contacts, insertContactSchema } from '../shared/schema';

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
      const allContacts = await db.select().from(contacts);
      return res.status(200).json(allContacts);
    }

    if (req.method === 'POST') {
      const validatedData = insertContactSchema.parse(req.body);
      const newContact = await db.insert(contacts).values([validatedData]).returning();
      return res.status(201).json(newContact[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in contacts API:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    return res.status(500).json({ error: error.message });
  }
}