// Main API entry point for Vercel serverless functions
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Import all route handlers
import { storage } from '../server/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Menu Items endpoints
app.get('/api/menu-items', async (req, res) => {
  try {
    const { category } = req.query;
    const items = category 
      ? await storage.getMenuItemsByCategory(category)
      : await storage.getAllMenuItems();
    res.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Error fetching menu items' });
  }
});

app.get('/api/menu-items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await storage.getMenuItem(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ message: 'Error fetching menu item' });
  }
});

app.post('/api/menu-items', async (req, res) => {
  try {
    const item = await storage.createMenuItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Error creating menu item' });
  }
});

app.put('/api/menu-items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await storage.updateMenuItem(id, req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Error updating menu item' });
  }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteMenuItem(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Error deleting menu item' });
  }
});

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    const { status, locationId } = req.query;
    let orders;
    
    if (status) {
      orders = await storage.getOrdersByStatus(status);
    } else if (locationId) {
      orders = await storage.getOrdersByLocation(locationId);
    } else {
      orders = await storage.getAllOrders();
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const items = await storage.getOrderItems(id);
    res.json({ ...order, items });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, ...orderData } = req.body;
    const order = await storage.createOrder(orderData, items);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const order = await storage.updateOrderStatus(id, status);
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteOrder(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order' });
  }
});

// Tables endpoints
app.get('/api/tables', async (req, res) => {
  try {
    const { locationId } = req.query;
    const tables = locationId 
      ? await storage.getTablesByLocation(locationId)
      : await storage.getAllTables();
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ message: 'Error fetching tables' });
  }
});

app.post('/api/tables', async (req, res) => {
  try {
    const table = await storage.createTable(req.body);
    res.status(201).json(table);
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ message: 'Error creating table' });
  }
});

app.put('/api/tables/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const table = await storage.updateTable(id, req.body);
    res.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({ message: 'Error updating table' });
  }
});

app.put('/api/tables/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const table = await storage.updateTableStatus(id, status);
    res.json(table);
  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({ message: 'Error updating table status' });
  }
});

// Reservations endpoints
app.get('/api/reservations', async (req, res) => {
  try {
    const { date } = req.query;
    const reservations = date 
      ? await storage.getReservationsByDate(date)
      : await storage.getAllReservations();
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const reservation = await storage.createReservation(req.body);
    res.status(201).json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Error creating reservation' });
  }
});

app.get('/api/availability', async (req, res) => {
  try {
    const { date, time } = req.query;
    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }
    
    const available = await storage.checkAvailability(date, time);
    res.json({ available });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Error checking availability' });
  }
});

// Contacts endpoint
app.post('/api/contacts', async (req, res) => {
  try {
    const contact = await storage.createContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Error creating contact' });
  }
});

// Export for Vercel serverless
export default app;