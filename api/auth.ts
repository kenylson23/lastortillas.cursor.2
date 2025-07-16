import { type VercelRequest, type VercelResponse } from "@vercel/node";
import { jwtLoginHandler, jwtLogoutHandler, requireJWTAuth, JWTRequest } from "../server/jwtAuth";
import { prisma } from "../server/db";

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
      return await jwtLoginHandler(req as any, res as any);
    }

    // Logout endpoint
    if (method === 'POST' && url?.includes('/logout')) {
      return jwtLogoutHandler(req as any, res as any);
    }

    // Verify endpoint
    if (method === 'GET' && url?.includes('/verify')) {
      return requireJWTAuth(req as JWTRequest, res as any, () => {
        res.status(200).json({ user: (req as JWTRequest).user });
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}