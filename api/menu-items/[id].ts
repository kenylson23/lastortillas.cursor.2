import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { insertMenuItemSchema } from '../../shared/schema';

export default async function (request: VercelRequest, response: VercelResponse) {
  const { id } = request.query;
  const menuId = parseInt(id as string);

  if (isNaN(menuId)) {
    return response.status(400).json({ error: 'Invalid menu item ID' });
  }

  if (request.method === 'GET') {
    try {
      const menuItem = await storage.getMenuItem(menuId);
      if (!menuItem) {
        return response.status(404).json({ error: 'Menu item not found' });
      }
      response.status(200).json(menuItem);
    } catch (error) {
      console.error('Error fetching menu item:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  } else if (request.method === 'PUT') {
    try {
      const updates = request.body;
      const updatedItem = await storage.updateMenuItem(menuId, updates);
      response.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating menu item:', error);
      response.status(400).json({ error: 'Invalid update data' });
    }
  } else if (request.method === 'DELETE') {
    try {
      await storage.deleteMenuItem(menuId);
      response.status(204).end();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  } else {
    response.status(405).json({ message: 'Method Not Allowed' });
  }
}