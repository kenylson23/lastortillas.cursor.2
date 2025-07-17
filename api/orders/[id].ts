import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function (request: VercelRequest, response: VercelResponse) {
  const { id } = request.query;
  const orderId = parseInt(id as string);

  if (isNaN(orderId)) {
    return response.status(400).json({ error: 'Invalid order ID' });
  }

  if (request.method === 'GET') {
    try {
      const order = await storage.getOrder(orderId);
      if (!order) {
        return response.status(404).json({ error: 'Order not found' });
      }
      
      // Get order items
      const items = await storage.getOrderItems(orderId);
      response.status(200).json({ ...order, items });
    } catch (error) {
      console.error('Error fetching order:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  } else if (request.method === 'DELETE') {
    try {
      await storage.deleteOrder(orderId);
      response.status(204).end();
    } catch (error) {
      console.error('Error deleting order:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  } else {
    response.status(405).json({ message: 'Method Not Allowed' });
  }
}