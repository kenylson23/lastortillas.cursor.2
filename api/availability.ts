import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { date, time } = req.query;
    
    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }
    
    const isAvailable = await storage.checkAvailability(date as string, time as string);
    
    res.setHeader('Cache-Control', 'public, max-age=5');
    res.json({ available: isAvailable });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ message: "Failed to check availability" });
  }
}