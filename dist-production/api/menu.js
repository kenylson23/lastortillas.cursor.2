"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const storage_1 = require("../server/storage");
const zod_1 = require("zod");
const menuItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    price: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    image: zod_1.z.string().optional(),
    available: zod_1.z.boolean().default(true),
    preparationTime: zod_1.z.number().default(15),
    customizations: zod_1.z.array(zod_1.z.string()).default([])
});
async function handler(req, res) {
    const { method, body, query } = req;
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    try {
        // GET /api/menu - Get all menu items
        if (method === 'GET' && !query.id) {
            const menuItems = await storage_1.storage.getAllMenuItems();
            return res.status(200).json(menuItems);
        }
        // GET /api/menu?id=123 - Get specific menu item
        if (method === 'GET' && query.id) {
            const id = parseInt(query.id);
            const menuItem = await storage_1.storage.getMenuItem(id);
            if (!menuItem) {
                return res.status(404).json({ error: "Menu item not found" });
            }
            return res.status(200).json(menuItem);
        }
        // POST /api/menu - Create new menu item
        if (method === 'POST') {
            const validatedData = menuItemSchema.parse(body);
            const newMenuItem = await storage_1.storage.createMenuItem(validatedData);
            return res.status(201).json(newMenuItem);
        }
        // PUT /api/menu?id=123 - Update menu item
        if (method === 'PUT' && query.id) {
            const id = parseInt(query.id);
            const validatedData = menuItemSchema.partial().parse(body);
            const updatedMenuItem = await storage_1.storage.updateMenuItem(id, validatedData);
            return res.status(200).json(updatedMenuItem);
        }
        // DELETE /api/menu?id=123 - Delete menu item
        if (method === 'DELETE' && query.id) {
            const id = parseInt(query.id);
            await storage_1.storage.deleteMenuItem(id);
            return res.status(204).end();
        }
        return res.status(405).json({ error: "Method not allowed" });
    }
    catch (error) {
        console.error('Menu error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
