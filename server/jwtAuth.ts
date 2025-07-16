import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

// JWT Secret - em produção, usar variável de ambiente
const JWT_SECRET = process.env.JWT_SECRET || 'las-tortillas-secret-key-2025';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  id: number | string;
  username: string;
  email: string;
  role: string;
}

export interface JWTRequest extends Request {
  user?: JWTPayload;
}

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
export function generateJWTToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verificar token JWT
export function verifyJWTToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Middleware de autenticação JWT
export function requireJWTAuth(req: JWTRequest, res: Response, next: NextFunction) {
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
  } catch (error) {
    return res.status(401).json({ error: "Erro na verificação do token" });
  }
}

// Handler de login JWT
export async function jwtLoginHandler(req: Request, res: Response) {
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

      const payload: JWTPayload = {
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
  } catch (error) {
    console.error('JWT Login error:', error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Handler de verificação JWT
export function jwtVerifyHandler(req: JWTRequest, res: Response) {
  // O middleware requireJWTAuth já verificou o token
  return res.json({ user: req.user });
}

// Handler de logout JWT
export function jwtLogoutHandler(req: Request, res: Response) {
  // Em JWT, o logout é feito no frontend removendo o token
  return res.json({ message: "Logout realizado com sucesso" });
}