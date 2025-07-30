const { VercelRequest, VercelResponse } = require('@vercel/node');
const { storage } = require('../shared/storage');
const { insertReservationSchema } = require('../shared/schema');

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  // Adicionar headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      console.log('Reservation creation request body:', req.body);
      
      const reservation = insertReservationSchema.parse(req.body);
      console.log('Parsed reservation data:', reservation);
      
      const newReservation = await storage.createReservation(reservation);
      console.log('Created reservation:', newReservation);
      
      res.status(201).json(newReservation);
    } catch (error) {
      console.error('Reservation creation error:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        res.status(400).json({ message: "Failed to create reservation" });
      }
    }
  } else if (req.method === 'GET') {
    try {
      const { date } = req.query;
      
      if (date) {
        const reservations = await storage.getReservationsByDate(date as string);
        res.json(reservations);
      } else {
        res.status(400).json({ message: "Date parameter is required" });
      }
    } catch (error) {
      console.error('Reservations fetch error:', error);
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}