import { type VercelRequest, type VercelResponse } from "@vercel/node";
import { storage } from "../server/storage";
import { z } from "zod";

const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.string().min(1),
  category: z.string().min(1),
  image: z.string().optional(),
  available: z.boolean().default(true),
  preparationTime: z.number().default(15),
  customizations: z.array(z.string()).default([])
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, body, query } = req;
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET /api/menu - Get all menu items
    if (method === 'GET' && !query.id) {
      const menuItems = await storage.getAllMenuItems();
      return res.status(200).json(menuItems);
    }

    // GET /api/menu?id=123 - Get specific menu item
    if (method === 'GET' && query.id) {
      const id = parseInt(query.id as string);
      const menuItem = await storage.getMenuItem(id);
      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      return res.status(200).json(menuItem);
    }

    // POST /api/menu - Create new menu item
    if (method === 'POST') {
      const validatedData = menuItemSchema.parse(body);
      const newMenuItem = await storage.createMenuItem(validatedData);
      return res.status(201).json(newMenuItem);
    }

    // PUT /api/menu?id=123 - Update menu item
    if (method === 'PUT' && query.id) {
      const id = parseInt(query.id as string);
      const validatedData = menuItemSchema.partial().parse(body);
      const updatedMenuItem = await storage.updateMenuItem(id, validatedData);
      return res.status(200).json(updatedMenuItem);
    }

    // DELETE /api/menu?id=123 - Delete menu item
    if (method === 'DELETE' && query.id) {
      const id = parseInt(query.id as string);
      await storage.deleteMenuItem(id);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error('Menu error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}