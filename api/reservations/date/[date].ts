import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { date } = request.query;
    
    if (!date) {
      return response.status(400).json({ error: 'Date is required' });
    }

    const reservations = await storage.getReservationsByDate(date as string);
    response.status(200).json(reservations);
  } catch (error) {
    console.error('Error fetching reservations by date:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}