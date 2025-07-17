import { type VercelRequest, type VercelResponse } from "@vercel/node";
import { ServerlessStorage } from "./lib/storage-serverless";
import { requireAuth, type AuthenticatedRequest } from "./lib/auth";
import { autoInitialize } from "./lib/sample-data";
import { serverlessResponse, handleServerlessError, validateRequestSize } from "./lib/serverless-utils";
import { z } from "zod";

const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  category: z.string().min(1),
  image: z.string().optional(),
  available: z.boolean().default(true),
  preparationTime: z.number().default(15),
  customizations: z.array(z.string()).default([])
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, body, query } = req;
  const response = serverlessResponse(res);

  // Validate request size for serverless
  if (!validateRequestSize(req)) {
    return response.badRequest('Request too large for serverless function');
  }
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Create serverless storage instance
  const storage = new ServerlessStorage();

  try {
    // Initialize sample data if needed
    await autoInitialize();

    // GET /api/menu - Get all menu items
    if (method === 'GET' && !query.id) {
      const menuItems = await storage.getAllMenuItems();
      return response.success(menuItems);
    }

    // GET /api/menu?id=123 - Get specific menu item
    if (method === 'GET' && query.id) {
      const id = parseInt(query.id as string);
      const menuItem = await storage.getMenuItem(id);
      if (!menuItem) {
        return response.notFound("Menu item not found");
      }
      return response.success(menuItem);
    }

    // POST /api/menu - Create new menu item (requires auth)
    if (method === 'POST') {
      const validatedData = menuItemSchema.parse(body);
      const newMenuItem = await storage.createMenuItem(validatedData as any);
      return response.success(newMenuItem, 201);
    }

    // PUT /api/menu?id=123 - Update menu item
    if (method === 'PUT' && query.id) {
      const id = parseInt(query.id as string);
      const validatedData = menuItemSchema.partial().parse(body);
      const updatedMenuItem = await storage.updateMenuItem(id, validatedData as any);
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
    const { message, status } = handleServerlessError(error);
    return response.error(message, status);
  } finally {
    // Cleanup database connection for serverless
    await storage.cleanup();
  }
}