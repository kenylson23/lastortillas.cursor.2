"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWTToken = generateJWTToken;
exports.verifyJWTToken = verifyJWTToken;
exports.requireJWTAuth = requireJWTAuth;
exports.jwtLoginHandler = jwtLoginHandler;
exports.jwtVerifyHandler = jwtVerifyHandler;
exports.jwtLogoutHandler = jwtLogoutHandler;
const jwt = __importStar(require("jsonwebtoken"));
const bcrypt = __importStar(require("bcryptjs"));
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
function generateJWTToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
// Verificar token JWT
function verifyJWTToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
// Middleware de autenticação JWT
function requireJWTAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Token não fornecido" });
    }
    try {
        const payload = verifyJWTToken(token);
        if (!payload) {
            return res.status(401).json({ error: "Token inválido" });
        }
        req.user = payload;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Erro na verificação do token" });
    }
}
// Handler de login JWT
async function jwtLoginHandler(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username e password são obrigatórios" });
        }
        // Verificar credenciais de admin
        if (username === ADMIN_CREDENTIALS.username) {
            const isValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.password);
            if (!isValid) {
                return res.status(401).json({ error: "Credenciais inválidas" });
            }
            const payload = {
                id: ADMIN_CREDENTIALS.id,
                username: ADMIN_CREDENTIALS.username,
                email: ADMIN_CREDENTIALS.email,
                role: ADMIN_CREDENTIALS.role
            };
            const token = generateJWTToken(payload);
            return res.json({
                token,
                user: payload,
                redirectTo: '/admin'
            });
        }
        return res.status(401).json({ error: "Credenciais inválidas" });
    }
    catch (error) {
        console.error('JWT Login error:', error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
}
// Handler de verificação JWT
function jwtVerifyHandler(req, res) {
    // O middleware requireJWTAuth já verificou o token
    return res.json({ user: req.user });
}
// Handler de logout JWT
function jwtLogoutHandler(req, res) {
    // Em JWT, o logout é feito no frontend removendo o token
    return res.json({ message: "Logout realizado com sucesso" });
}
