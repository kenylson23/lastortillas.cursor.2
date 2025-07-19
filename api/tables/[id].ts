import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function (request: VercelRequest, response: VercelResponse) {
  const { id } = request.query;
  const tableId = parseInt(id as string);

  if (isNaN(tableId)) {
    return response.status(400).json({ error: 'Invalid table ID' });
  }

  if (request.method === 'GET') {
    try {
      const table = await storage.getTable(tableId);
      if (!table) {
        return response.status(404).json({ error: 'Table not found' });
      }
      response.status(200).json(table);
    } catch (error) {
      console.error('Error fetching table:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  } else if (request.method === 'PUT') {
    try {
      const updates = request.body;
      const updatedTable = await storage.updateTable(tableId, updates);
      response.status(200).json(updatedTable);
    } catch (error) {
      console.error('Error updating table:', error);
      response.status(400).json({ error: 'Invalid update data' });
    }
  } else if (request.method === 'DELETE') {
    try {
      await storage.deleteTable(tableId);
      response.status(204).end();
    } catch (error) {
      console.error('Error deleting table:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  } else {
    response.status(405).json({ message: 'Method Not Allowed' });
  }
}