import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertReservationSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const reservation = insertReservationSchema.parse(req.body);
      const newReservation = await storage.createReservation(reservation);
      
      res.status(201).json(newReservation);
    } catch (error) {
      console.error('Reservation creation error:', error);
      res.status(400).json({ message: "Failed to create reservation" });
    }
  } else if (req.method === 'GET') {
    try {
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }
      
      const reservations = await storage.getReservationsByDate(date as string);
      res.json(reservations);
    } catch (error) {
      console.error('Reservations fetch error:', error);
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}