"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = loginHandler;
exports.logoutHandler = logoutHandler;
exports.requireAuth = requireAuth;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const JWT_SECRET = process.env.JWT_SECRET || 'las-tortillas-secret-key-2025';
const ADMIN_USERNAME = 'administrador';
const ADMIN_PASSWORD_HASH = '$2a$10$8K9wTyKyN7qE.fT.XmF6ZeLtOhKvP5Vz.sJ3RwM.K4YyW1BzYfGF2'; // lasTortillas2025!
// Login handler
async function loginHandler(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        // Check credentials
        if (username !== ADMIN_USERNAME) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, ADMIN_PASSWORD_HASH);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate JWT token
        const user = {
            id: 'admin-1',
            username: ADMIN_USERNAME,
            role: 'admin'
        };
        const token = jsonwebtoken_1.default.sign(user, JWT_SECRET, { expiresIn: '24h' });
        return res.status(200).json({
            message: 'Login successful',
            token,
            user
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
// Logout handler
function logoutHandler(req, res) {
    return res.status(200).json({ message: 'Logout successful' });
}
// Auth middleware
function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (jwtError) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
// Verify token
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
