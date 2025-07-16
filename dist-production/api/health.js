"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const monitoring_1 = require("../server/monitoring");
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
            const health = await (0, monitoring_1.getHealthStatus)();
            const statusCode = health.status === 'healthy' ? 200 :
                health.status === 'degraded' ? 503 : 503;
            res.status(statusCode).json(health);
        }
        catch (error) {
            console.error('Health check error:', error);
            res.status(500).json({
                status: 'error',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
