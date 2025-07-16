import { type VercelRequest, type VercelResponse } from "@vercel/node";
import { validateCredentials, generateToken } from "../server/auth";
import { prisma } from "../server/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, body } = req;
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (method === 'POST' && req.url?.includes('/login')) {
      const { username, password } = body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await validateCredentials(username, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user);
      return res.status(200).json({ token, user });
    }

    if (method === 'POST' && req.url?.includes('/logout')) {
      return res.status(200).json({ message: "Logged out successfully" });
    }

    if (method === 'GET' && req.url?.includes('/verify')) {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.substring(7);
      const { verifyToken } = await import('../server/auth');
      const user = verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid token" });
      }

      return res.status(200).json({ user });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}