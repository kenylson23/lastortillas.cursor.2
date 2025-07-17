"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const database_1 = require("./lib/database");
async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method === 'GET') {
        try {
            // Test database connection
            const db = (0, database_1.getDatabase)();
            const result = await db.execute('SELECT 1 as test');
            const isDbConnected = result && result.length > 0;
            return res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                database: {
                    connected: isDbConnected,
                    driver: 'postgres-js',
                    orm: 'drizzle'
                },
                environment: process.env.NODE_ENV || 'production',
                serverless: true
            });
        }
        catch (error) {
            console.error('Health check failed:', error);
            return res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                database: {
                    connected: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                environment: process.env.NODE_ENV || 'production',
                serverless: true
            });
        }
    }
    else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
