import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auth, adminAuth } from '../shared/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Verificar credenciais
      if (username === 'admin' && password === 'admin123') {
        res.json({ 
          user: { id: 'admin', email: 'admin@lastortilhas.com', role: 'admin' },
          session: { token: 'admin-token' }
        });
      } else if (username === 'kitchen' && password === 'kitchen123') {
        res.json({ 
          user: { id: 'kitchen', email: 'kitchen@lastortilhas.com', role: 'kitchen' },
          session: { token: 'kitchen-token' }
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ message: "Authentication failed" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}