const { VercelRequest, VercelResponse } = require('@vercel/node');
const { storage } = require('../shared/storage');
const { insertContactSchema } = require('../shared/schema');

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
      console.log('Contact creation request body:', req.body);
      
      const contact = insertContactSchema.parse(req.body);
      console.log('Parsed contact data:', contact);
      
      const newContact = await storage.createContact(contact);
      console.log('Created contact:', newContact);
      
      res.status(201).json(newContact);
    } catch (error) {
      console.error('Contact creation error:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        res.status(400).json({ message: "Failed to create contact" });
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}