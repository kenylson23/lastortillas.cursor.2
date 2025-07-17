import { type VercelRequest, type VercelResponse } from "@vercel/node";
import { storage } from "./lib/storage-serverless";
import { requireAuth, type AuthenticatedRequest } from "./lib/auth";
import { autoInitialize } from "./lib/sample-data";
import { z } from "zod";

const tableSchema = z.object({
  tableNumber: z.number().min(1),
  seats: z.number().min(1),
  locationId: z.string().min(1),
  status: z.enum(['available', 'occupied', 'reserved']).default('available')
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
    // Initialize sample data if needed
    await autoInitialize();

    // GET /api/tables - Get all tables
    if (method === 'GET' && !query.id) {
      const tables = await storage.getAllTables();
      return res.status(200).json(tables);
    }

    // GET /api/tables?id=123 - Get specific table
    if (method === 'GET' && query.id) {
      const id = parseInt(query.id as string);
      const table = await storage.getTable(id);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      return res.status(200).json(table);
    }

    // POST /api/tables - Create new table
    if (method === 'POST') {
      const validatedData = tableSchema.parse(body);
      const newTable = await storage.createTable(validatedData as any);
      return res.status(201).json(newTable);
    }

    // PUT /api/tables?id=123 - Update table
    if (method === 'PUT' && query.id) {
      const id = parseInt(query.id as string);
      
      // Check if it's a status update
      if (body.status && req.url?.includes('/status')) {
        const updatedTable = await storage.updateTableStatus(id, body.status);
        return res.status(200).json(updatedTable);
      }
      
      // Regular table update
      const validatedData = tableSchema.partial().parse(body);
      const updatedTable = await storage.updateTable(id, validatedData);
      return res.status(200).json(updatedTable);
    }

    // DELETE /api/tables?id=123 - Delete table
    if (method === 'DELETE' && query.id) {
      const id = parseInt(query.id as string);
      await storage.deleteTable(id);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error('Tables error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}