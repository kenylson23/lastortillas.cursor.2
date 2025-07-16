import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

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

export interface AuthUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Gerar token JWT
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verificar token JWT
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      username: decoded.username,
      firstName: decoded.firstName || 'Admin',
      lastName: decoded.lastName || 'Las Tortillas',
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

// Middleware de autenticação
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
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
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
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
export async function validateCredentials(username: string, password: string): Promise<AuthUser | null> {
  try {
    if (username === ADMIN_CREDENTIALS.username) {
      const isValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.password);
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
  } catch (error) {
    console.error('Error validating credentials:', error);
    return null;
  }
}

// Hash password (para gerar novas senhas)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verificar se é admin
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  next();
}