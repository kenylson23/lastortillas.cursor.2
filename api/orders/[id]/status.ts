import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';

export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'PATCH') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = request.query;
  const orderId = parseInt(id as string);

  if (isNaN(orderId)) {
    return response.status(400).json({ error: 'Invalid order ID' });
  }

  try {
    const { status } = request.body;
    
    if (!status) {
      return response.status(400).json({ error: 'Status is required' });
    }

    const updatedOrder = await storage.updateOrderStatus(orderId, status);
    response.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}