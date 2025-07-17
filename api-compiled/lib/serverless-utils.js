"use strict";
/**
 * SERVERLESS UTILITIES
 * Helper functions for Vercel serverless function optimization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUEST_LIMITS = exports.isDevelopment = exports.isProduction = exports.isServerless = exports.SERVERLESS_TIMEOUT = void 0;
exports.optimizeMemory = optimizeMemory;
exports.serverlessResponse = serverlessResponse;
exports.withTimeout = withTimeout;
exports.serverlessLog = serverlessLog;
exports.handleServerlessError = handleServerlessError;
exports.validateRequestSize = validateRequestSize;
// Request timeout for serverless functions
exports.SERVERLESS_TIMEOUT = 10000; // 10 seconds
// Memory management for serverless
function optimizeMemory() {
    if (global.gc) {
        global.gc();
    }
}
// Response helpers with proper headers
function serverlessResponse(res) {
    // CORS headers for serverless
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Performance headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Powered-By', 'Las Tortillas Serverless');
    return {
        success: (data, statusCode = 200) => {
            res.status(statusCode).json({ success: true, data });
        },
        error: (message, statusCode = 500) => {
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
function withTimeout(promiseFactory, timeoutMs = exports.SERVERLESS_TIMEOUT) {
    return Promise.race([
        promiseFactory(),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        })
    ]);
}
// Environment helpers
exports.isServerless = Boolean(process.env.VERCEL);
exports.isProduction = process.env.NODE_ENV === 'production';
exports.isDevelopment = !exports.isProduction && !exports.isServerless;
// Logging helper for serverless
function serverlessLog(message, data) {
    if (exports.isDevelopment) {
        console.log(`[${new Date().toISOString()}] ${message}`, data || '');
    }
}
// Error handling for serverless
function handleServerlessError(error) {
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
exports.REQUEST_LIMITS = {
    maxBodySize: 1024 * 1024, // 1MB
    maxUrlLength: 2048,
    maxHeaderSize: 8192
};
// Validate request size
function validateRequestSize(req) {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    return contentLength <= exports.REQUEST_LIMITS.maxBodySize;
}
