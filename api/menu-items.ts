import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertMenuItemSchema } from '../shared/schema';

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method === 'GET') {
    try {
      const menuItems = await storage.getAllMenuItems();
      response.status(200).json(menuItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  } else if (request.method === 'POST') {
    try {
      const validatedData = insertMenuItemSchema.parse(request.body);
      const menuItem = await storage.createMenuItem(validatedData);
      
      response.status(201).json(menuItem);
    } catch (error) {
      console.error('Error creating menu item:', error);
      response.status(400).json({ error: 'Invalid menu item data' });
    }
  } else {
    response.status(405).json({ message: 'Method Not Allowed' });
  }
}