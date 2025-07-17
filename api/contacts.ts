import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertContactSchema } from '../shared/schema';

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const validatedData = insertContactSchema.parse(request.body);
    const contact = await storage.createContact(validatedData);
    
    response.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    response.status(400).json({ error: 'Invalid contact data' });
  }
}