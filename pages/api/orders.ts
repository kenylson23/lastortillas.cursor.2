import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db-nextjs';
import { orders, orderItems, insertOrderSchema, insertOrderItemSchema } from '../../lib/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const allOrders = await db.select().from(orders);
        return res.status(200).json(allOrders);

      case 'POST':
        const { order, items } = req.body;
        
        // Validate order data
        const validatedOrder = insertOrderSchema.parse(order);
        
        // Validate order items
        const validatedItems = items.map((item: any) => insertOrderItemSchema.parse(item));
        
        // Create order with transaction
        const [newOrder] = await db.insert(orders).values(validatedOrder).returning();
        
        // Create order items
        const orderItemsWithOrderId = validatedItems.map((item: any) => ({
          ...item,
          orderId: newOrder.id,
        }));
        
        await db.insert(orderItems).values(orderItemsWithOrderId);
        
        return res.status(201).json(newOrder);

      case 'PUT':
        const { id } = req.query;
        if (!id || isNaN(Number(id))) {
          return res.status(400).json({ message: 'Invalid ID' });
        }
        
        const updateData = insertOrderSchema.partial().parse(req.body);
        const [updatedOrder] = await db
          .update(orders)
          .set({ ...updateData, updatedAt: new Date() })
          .where(eq(orders.id, Number(id)))
          .returning();
        
        if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
        }
        
        return res.status(200).json(updatedOrder);

      case 'DELETE':
        const { id: deleteId } = req.query;
        if (!deleteId || isNaN(Number(deleteId))) {
          return res.status(400).json({ message: 'Invalid ID' });
        }
        
        // Delete order items first
        await db.delete(orderItems).where(eq(orderItems.orderId, Number(deleteId)));
        
        // Delete order
        await db.delete(orders).where(eq(orders.id, Number(deleteId)));
        
        return res.status(204).end();

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}