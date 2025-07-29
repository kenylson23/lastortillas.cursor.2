import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../shared/storage';
import { insertContactSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const contact = insertContactSchema.parse(req.body);
      const newContact = await storage.createContact(contact);
      
      res.status(201).json(newContact);
    } catch (error) {
      console.error('Contact creation error:', error);
      res.status(400).json({ message: "Failed to create contact" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}