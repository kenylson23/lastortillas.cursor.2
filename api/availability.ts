import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../server/db';
import { reservations } from '../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({ error: 'Data e hora são obrigatórias' });
    }

    const existingReservations = await db.select().from(reservations).where(eq(reservations.date, date as string));
    
    // Check if time slot is available
    const isAvailable = !existingReservations.some(r => r.time === time);

    return res.status(200).json({ 
      available: isAvailable,
      date,
      time,
      existingReservations: existingReservations.length 
    });
  } catch (error: any) {
    console.error('Error in availability API:', error);
    return res.status(500).json({ error: error.message });
  }
}