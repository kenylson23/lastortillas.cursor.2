import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../shared/storage';
import { insertMenuItemSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const menuItem = insertMenuItemSchema.parse(req.body);
      const newMenuItem = await storage.createMenuItem(menuItem);
      
      res.status(201).json(newMenuItem);
    } catch (error) {
      console.error('Menu item creation error:', error);
      res.status(400).json({ message: "Failed to create menu item" });
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