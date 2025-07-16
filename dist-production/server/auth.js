"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.authenticateToken = authenticateToken;
exports.optionalAuth = optionalAuth;
exports.validateCredentials = validateCredentials;
exports.hashPassword = hashPassword;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// JWT Secret - em produção, usar variável de ambiente
const JWT_SECRET = process.env.JWT_SECRET || 'las-tortillas-secret-key-2025';
const JWT_EXPIRES_IN = '7d';
// Admin credentials - em produção, armazenar no database
const ADMIN_CREDENTIALS = {
    username: 'administrador',
    password: '$2b$10$F3nwbLcOBHurs1gIMzgZ7eWQL9VonoLa2UCPAqXaBFXTjc5Ya2kMC', // lasTortillas2025!
    id: 1,
    firstName: 'Admin',
    lastName: 'Las Tortillas',
    email: 'admin@lastortillas.com',
    role: 'admin'
};
// Gerar token JWT
function generateToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
// Verificar token JWT
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return {
            id: decoded.id,
            username: decoded.username,
            firstName: decoded.firstName || 'Admin',
            lastName: decoded.lastName || 'Las Tortillas',
            email: decoded.email,
            role: decoded.role
        };
    }
    catch (error) {
        return null;
    }
}
// Middleware de autenticação
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ message: 'Token de acesso requerido' });
    }
    const user = verifyToken(token);
    if (!user) {
        return res.status(403).json({ message: 'Token inválido ou expirado' });
    }
    req.user = user;
    next();
}
// Middleware opcional de autenticação (não retorna erro se não autenticado)
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        const user = verifyToken(token);
        if (user) {
            req.user = user;
        }
    }
    next();
}
// Verificar credenciais de login
async function validateCredentials(username, password) {
    try {
        if (username === ADMIN_CREDENTIALS.username) {
            const isValid = await bcryptjs_1.default.compare(password, ADMIN_CREDENTIALS.password);
            if (isValid) {
                return {
                    id: ADMIN_CREDENTIALS.id,
                    username: ADMIN_CREDENTIALS.username,
                    firstName: ADMIN_CREDENTIALS.firstName,
                    lastName: ADMIN_CREDENTIALS.lastName,
                    email: ADMIN_CREDENTIALS.email,
                    role: ADMIN_CREDENTIALS.role
                };
            }
        }
        return null;
    }
    catch (error) {
        console.error('Error validating credentials:', error);
        return null;
    }
}
// Hash password (para gerar novas senhas)
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 10);
}
// Verificar se é admin
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito a administradores' });
    }
    next();
}
