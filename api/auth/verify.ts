import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../../server/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Token não fornecido',
        authenticated: false 
      });
    }

    // Verificar token
    const user = verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token inválido ou expirado',
        authenticated: false 
      });
    }

    // Token válido
    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor',
      authenticated: false 
    });
  }
}