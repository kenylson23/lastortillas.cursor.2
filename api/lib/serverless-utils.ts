/**
 * SERVERLESS UTILITIES
 * Helper functions for Vercel serverless function optimization
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Request timeout for serverless functions
export const SERVERLESS_TIMEOUT = 10000; // 10 seconds

// Memory management for serverless
export function optimizeMemory() {
  if (global.gc) {
    global.gc();
  }
}

// Response helpers with proper headers
export function serverlessResponse(res: VercelResponse) {
  // CORS headers for serverless
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Performance headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('X-Powered-By', 'Las Tortillas Serverless');
  
  return {
    success: (data: any, statusCode = 200) => {
      res.status(statusCode).json({ success: true, data });
    },
    error: (message: string, statusCode = 500) => {
      res.status(statusCode).json({ success: false, error: message });
    },
    notFound: (message = 'Not found') => {
      res.status(404).json({ success: false, error: message });
    },
    badRequest: (message = 'Bad request') => {
      res.status(400).json({ success: false, error: message });
    },
    unauthorized: (message = 'Unauthorized') => {
      res.status(401).json({ success: false, error: message });
    }
  };
}

// Request timeout wrapper
export function withTimeout<T>(
  promiseFactory: () => Promise<T>, 
  timeoutMs: number = SERVERLESS_TIMEOUT
): Promise<T> {
  return Promise.race([
    promiseFactory(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    })
  ]);
}

// Environment helpers
export const isServerless = Boolean(process.env.VERCEL);
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = !isProduction && !isServerless;

// Logging helper for serverless
export function serverlessLog(message: string, data?: any) {
  if (isDevelopment) {
    console.log(`[${new Date().toISOString()}] ${message}`, data || '');
  }
}

// Error handling for serverless
export function handleServerlessError(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    serverlessLog('Serverless error:', error.message);
    
    // Map specific errors to HTTP status codes
    if (error.message.includes('timeout')) {
      return { message: 'Request timeout', status: 408 };
    }
    if (error.message.includes('not found')) {
      return { message: 'Resource not found', status: 404 };
    }
    if (error.message.includes('unauthorized')) {
      return { message: 'Unauthorized', status: 401 };
    }
    if (error.message.includes('validation')) {
      return { message: 'Validation error', status: 400 };
    }
    
    return { message: error.message, status: 500 };
  }
  
  return { message: 'Internal server error', status: 500 };
}

// Request size limits for serverless
export const REQUEST_LIMITS = {
  maxBodySize: 1024 * 1024, // 1MB
  maxUrlLength: 2048,
  maxHeaderSize: 8192
};

// Validate request size
export function validateRequestSize(req: VercelRequest): boolean {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  return contentLength <= REQUEST_LIMITS.maxBodySize;
}