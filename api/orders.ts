import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../shared/storage';
import { insertOrderSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const order = insertOrderSchema.parse(req.body);
      const newOrder = await storage.createOrder(order);
      
      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(400).json({ message: "Failed to create order" });
    }
  } else if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      if (id) {
        const order = await storage.getOrderById(id as string);
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
      } else {
        const orders = await storage.getAllOrders();
        res.json(orders);
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { id } = req.query;
      const { status } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "Order ID is required" });
      }
      
      // Atualizar status do pedido
      const updatedOrder = await storage.updateOrderStatus(parseInt(id as string), status);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Order status update error:', error);
      res.status(400).json({ message: "Failed to update order status" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: "Order ID is required" });
      }
      
      await storage.deleteOrder(parseInt(id as string));
      res.status(204).send();
    } catch (error) {
      console.error('Order deletion error:', error);
      res.status(400).json({ message: "Failed to delete order" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}