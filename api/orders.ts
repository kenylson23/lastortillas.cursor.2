const { VercelRequest, VercelResponse } = require('@vercel/node');
const { storage } = require('../shared/storage');
const { insertOrderSchema } = require('../shared/schema');

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  // Adicionar headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      console.log('Order creation request body:', req.body);
      
      const order = insertOrderSchema.parse(req.body);
      console.log('Parsed order data:', order);
      
      const newOrder = await storage.createOrder(order);
      console.log('Created order:', newOrder);
      
      res.status(201).json(newOrder);
    } catch (error) {
      console.error('Order creation error:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        res.status(400).json({ message: "Failed to create order" });
      }
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
        const orders = await (storage.getAllOrders as () => Promise<any>)();
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
      
      console.log('Updating order status:', { id, status });
      const updatedOrder = await storage.updateOrderStatus(parseInt(id as string), status);
      console.log('Updated order:', updatedOrder);
      
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
      
      console.log('Deleting order:', id);
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