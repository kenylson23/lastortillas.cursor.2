import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'las-tortillas-secret-key-2025';
const ADMIN_USERNAME = 'administrador';
const ADMIN_PASSWORD_HASH = '$2a$10$8K9wTyKyN7qE.fT.XmF6ZeLtOhKvP5Vz.sJ3RwM.K4YyW1BzYfGF2'; // lasTortillas2025!

export interface JWTUser {
  id: string;
  username: string;
  role: 'admin';
}

export interface AuthenticatedRequest extends VercelRequest {
  user?: JWTUser;
}

// Login handler
export async function loginHandler(req: VercelRequest, res: VercelResponse) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check credentials
    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const user: JWTUser = {
      id: 'admin-1',
      username: ADMIN_USERNAME,
      role: 'admin'
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Logout handler
export function logoutHandler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ message: 'Logout successful' });
}

// Auth middleware
export function requireAuth(
  req: AuthenticatedRequest,
  res: VercelResponse,
  next: () => void
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTUser;
      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Verify token
export function verifyToken(token: string): JWTUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTUser;
  } catch (error) {
    return null;
  }
}