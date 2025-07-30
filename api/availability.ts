const { VercelRequest, VercelResponse } = require('@vercel/node');
const { storage } = require('../shared/storage');

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

  if (req.method === 'GET') {
    try {
      const { date, time } = req.query;
      
      if (!date || !time) {
        return res.status(400).json({ message: "Date and time parameters are required" });
      }
      
      console.log('Checking availability for:', { date, time });
      const isAvailable = await storage.checkAvailability(date as string, time as string);
      console.log('Availability result:', isAvailable);
      
      res.json({ available: isAvailable });
    } catch (error) {
      console.error('Availability check error:', error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}