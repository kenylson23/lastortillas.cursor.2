import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertTableSchema } from '../shared/schema';

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method === 'GET') {
    try {
      const { location } = request.query;
      
      if (location) {
        const tables = await storage.getTablesByLocation(location as string);
        response.status(200).json(tables);
      } else {
        const tables = await storage.getAllTables();
        response.status(200).json(tables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  } else if (request.method === 'POST') {
    try {
      const validatedData = insertTableSchema.parse(request.body);
      const table = await storage.createTable(validatedData);
      
      response.status(201).json(table);
    } catch (error) {
      console.error('Error creating table:', error);
      response.status(400).json({ error: 'Invalid table data' });
    }
  } else {
    response.status(405).json({ message: 'Method Not Allowed' });
  }
}