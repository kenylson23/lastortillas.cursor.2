"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method === 'GET') {
        return res.json({
            message: 'Las Tortillas Mexican Grill API',
            status: 'online',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            endpoints: [
                '/api/menu-items',
                '/api/orders',
                '/api/reservations',
                '/api/contacts',
                '/api/tables',
                '/api/health',
                '/api/auth'
            ]
        });
    }
    return res.status(405).json({ message: 'Method not allowed' });
}
