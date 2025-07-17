"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const auth_1 = require("./lib/auth");
async function handler(req, res) {
    const { method, url } = req;
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    try {
        // Login endpoint
        if (method === 'POST' && url?.includes('/login')) {
            return await (0, auth_1.loginHandler)(req, res);
        }
        // Logout endpoint
        if (method === 'POST' && url?.includes('/logout')) {
            return (0, auth_1.logoutHandler)(req, res);
        }
        // Verify endpoint
        if (method === 'GET' && url?.includes('/verify')) {
            return (0, auth_1.requireAuth)(req, res, () => {
                res.status(200).json({ user: req.user });
            });
        }
        // Default auth check endpoint
        if (method === 'POST') {
            return await (0, auth_1.loginHandler)(req, res);
        }
        return res.status(405).json({ error: "Method not allowed" });
    }
    catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
