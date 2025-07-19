import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db-nextjs';
import { menuItems, insertMenuItemSchema } from '../../lib/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const items = await db.select().from(menuItems);
        return res.status(200).json(items);

      case 'POST':
        const validatedData = insertMenuItemSchema.parse(req.body);
        const [newItem] = await db.insert(menuItems).values(validatedData).returning();
        return res.status(201).json(newItem);

      case 'PUT':
        const { id } = req.query;
        if (!id || isNaN(Number(id))) {
          return res.status(400).json({ message: 'Invalid ID' });
        }
        
        const updateData = insertMenuItemSchema.partial().parse(req.body);
        const [updatedItem] = await db
          .update(menuItems)
          .set(updateData)
          .where(eq(menuItems.id, Number(id)))
          .returning();
        
        if (!updatedItem) {
          return res.status(404).json({ message: 'Menu item not found' });
        }
        
        return res.status(200).json(updatedItem);

      case 'DELETE':
        const { id: deleteId } = req.query;
        if (!deleteId || isNaN(Number(deleteId))) {
          return res.status(400).json({ message: 'Invalid ID' });
        }
        
        await db.delete(menuItems).where(eq(menuItems.id, Number(deleteId)));
        return res.status(204).end();

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Menu items API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}