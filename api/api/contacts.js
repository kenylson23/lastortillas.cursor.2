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
            const allContacts = await db_1.db.select().from(schema_1.contacts);
            return res.status(200).json(allContacts);
        }
        if (req.method === 'POST') {
            const validatedData = schema_1.insertContactSchema.parse(req.body);
            const newContact = await db_1.db.insert(schema_1.contacts).values(validatedData).returning();
            return res.status(201).json(newContact[0]);
        }
        return res.status(405).json({ error: 'Method not allowed' });
    }
    catch (error) {
        console.error('Error in contacts API:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: "Dados inválidos", details: error.errors });
        }
        return res.status(500).json({ error: error.message });
    }
}
