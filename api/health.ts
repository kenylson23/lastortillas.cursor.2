import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Handle CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method === 'GET') {
    return response.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Las Tortillas Mexican Grill API',
      version: '1.0.0'
    });
  }

  return response.status(405).json({ message: 'Method not allowed' });
}