import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../shared/storage';
import { insertMenuItemSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      console.log('Menu item creation request body:', req.body);
      
      const menuItem = insertMenuItemSchema.parse(req.body);
      console.log('Parsed menu item data:', menuItem);
      
      const newMenuItem = await storage.createMenuItem(menuItem);
      console.log('Created menu item:', newMenuItem);
      
      res.status(201).json(newMenuItem);
    } catch (error) {
      console.error('Menu item creation error:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        res.status(400).json({ message: "Failed to create menu item" });
      }
    }
  } else if (req.method === 'GET') {
    try {
      const { category } = req.query;
      
      if (category) {
        const items = await storage.getMenuItemsByCategory(category as string);
        res.json(items);
      } else {
        const items = await storage.getAllMenuItems();
        res.json(items);
      }
    } catch (error) {
      console.error('Menu items fetch error:', error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}