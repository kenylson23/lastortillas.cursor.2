import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'PATCH') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = request.query;
  const tableId = parseInt(id as string);

  if (isNaN(tableId)) {
    return response.status(400).json({ error: 'Invalid table ID' });
  }

  try {
    const { status } = request.body;
    
    if (!status) {
      return response.status(400).json({ error: 'Status is required' });
    }

    const updatedTable = await storage.updateTableStatus(tableId, status);
    response.status(200).json(updatedTable);
  } catch (error) {
    console.error('Error updating table status:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}