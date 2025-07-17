import { type VercelRequest, type VercelResponse } from "@vercel/node";
import { loginHandler, logoutHandler, requireAuth, verifyToken, type AuthenticatedRequest } from "./lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      return await loginHandler(req, res);
    }

    // Logout endpoint
    if (method === 'POST' && url?.includes('/logout')) {
      return logoutHandler(req, res);
    }

    // Verify endpoint
    if (method === 'GET' && url?.includes('/verify')) {
      return requireAuth(req as AuthenticatedRequest, res, () => {
        res.status(200).json({ user: (req as AuthenticatedRequest).user });
      });
    }

    // Default auth check endpoint
    if (method === 'POST') {
      return await loginHandler(req, res);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}