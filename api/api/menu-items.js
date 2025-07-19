"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = require("../server/db");
const schema_1 = require("../shared/schema");
async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    try {
        if (req.method === 'GET') {
            const items = await db_1.db.select().from(schema_1.menuItems);
            return res.status(200).json(items);
        }
        if (req.method === 'POST') {
            const newItem = await db_1.db.insert(schema_1.menuItems).values(req.body).returning();
            return res.status(201).json(newItem[0]);
        }
        return res.status(405).json({ error: 'Method not allowed' });
    }
    catch (error) {
        console.error('Error in menu-items API:', error);
        return res.status(500).json({ error: error.message });
    }
}
