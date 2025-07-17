import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertReservationSchema } from '../shared/schema';

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method === 'POST') {
    try {
      const validatedData = insertReservationSchema.parse(request.body);
      const reservation = await storage.createReservation(validatedData);
      
      response.status(201).json(reservation);
    } catch (error) {
      console.error('Error creating reservation:', error);
      response.status(400).json({ error: 'Invalid reservation data' });
    }
  } else if (request.method === 'GET') {
    try {
      const reservations = await storage.getAllReservations();
      response.status(200).json(reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  } else {
    response.status(405).json({ message: 'Method Not Allowed' });
  }
}