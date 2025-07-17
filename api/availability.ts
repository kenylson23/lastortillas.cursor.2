import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { date, time } = request.query;
    
    if (!date || !time) {
      return response.status(400).json({ error: 'Date and time are required' });
    }

    const available = await storage.checkAvailability(date as string, time as string);
    
    response.status(200).json({ available });
  } catch (error) {
    console.error('Error checking availability:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}