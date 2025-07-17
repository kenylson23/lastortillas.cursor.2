"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const storage_serverless_1 = require("./lib/storage-serverless");
const sample_data_1 = require("./lib/sample-data");
const serverless_utils_1 = require("./lib/serverless-utils");
const zod_1 = require("zod");
const menuItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    price: zod_1.z.number().min(0),
    category: zod_1.z.string().min(1),
    image: zod_1.z.string().optional(),
    available: zod_1.z.boolean().default(true),
    preparationTime: zod_1.z.number().default(15),
    customizations: zod_1.z.array(zod_1.z.string()).default([])
});
async function handler(req, res) {
    const { method, body, query } = req;
    const response = (0, serverless_utils_1.serverlessResponse)(res);
    // Validate request size for serverless
    if (!(0, serverless_utils_1.validateRequestSize)(req)) {
        return response.badRequest('Request too large for serverless function');
    }
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    // Create serverless storage instance
    const storage = new storage_serverless_1.ServerlessStorage();
    try {
        // Initialize sample data if needed
        await (0, sample_data_1.autoInitialize)();
        // GET /api/menu - Get all menu items
        if (method === 'GET' && !query.id) {
            const menuItems = await storage.getAllMenuItems();
            return response.success(menuItems);
        }
        // GET /api/menu?id=123 - Get specific menu item
        if (method === 'GET' && query.id) {
            const id = parseInt(query.id);
            const menuItem = await storage.getMenuItem(id);
            if (!menuItem) {
                return response.notFound("Menu item not found");
            }
            return response.success(menuItem);
        }
        // POST /api/menu - Create new menu item (requires auth)
        if (method === 'POST') {
            const validatedData = menuItemSchema.parse(body);
            const newMenuItem = await storage.createMenuItem(validatedData);
            return response.success(newMenuItem, 201);
        }
        // PUT /api/menu?id=123 - Update menu item
        if (method === 'PUT' && query.id) {
            const id = parseInt(query.id);
            const validatedData = menuItemSchema.partial().parse(body);
            const updatedMenuItem = await storage.updateMenuItem(id, validatedData);
            return res.status(200).json(updatedMenuItem);
        }
        // DELETE /api/menu?id=123 - Delete menu item
        if (method === 'DELETE' && query.id) {
            const id = parseInt(query.id);
            await storage.deleteMenuItem(id);
            return res.status(204).end();
        }
        return res.status(405).json({ error: "Method not allowed" });
    }
    catch (error) {
        const { message, status } = (0, serverless_utils_1.handleServerlessError)(error);
        return response.error(message, status);
    }
    finally {
        // Cleanup database connection for serverless
        await storage.cleanup();
    }
}
