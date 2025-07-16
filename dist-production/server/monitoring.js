"use strict";
/**
 * Sistema de monitoramento para produção Vercel
 * Implementa logs estruturados e métricas de performance
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.ProductionLogger = void 0;
exports.createApiMetricsMiddleware = createApiMetricsMiddleware;
exports.getHealthStatus = getHealthStatus;
class ProductionLogger {
    constructor() {
        this.environment = process.env.NODE_ENV || 'development';
        this.isProduction = this.environment === 'production' || Boolean(process.env.VERCEL);
    }
    createLogEntry(level, message, source, metadata) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            source,
            metadata,
            environment: this.environment,
            requestId: process.env.VERCEL_TRACE_ID
        };
    }
    info(message, source = 'app', metadata) {
        const entry = this.createLogEntry('info', message, source, metadata);
        if (this.isProduction) {
            console.log(JSON.stringify(entry));
        }
        else {
            const timestamp = new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
            console.log(`${timestamp} [${source}] ${message}`);
        }
    }
    warn(message, source = 'app', metadata) {
        const entry = this.createLogEntry('warn', message, source, metadata);
        if (this.isProduction) {
            console.warn(JSON.stringify(entry));
        }
        else {
            console.warn(`⚠️  ${message}`);
        }
    }
    error(message, source = 'app', error, metadata) {
        const entry = this.createLogEntry('error', message, source, {
            ...metadata,
            error: error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : undefined
        });
        if (this.isProduction) {
            console.error(JSON.stringify(entry));
        }
        else {
            console.error(`❌ ${message}`, error);
        }
    }
    // Métricas de performance para APIs
    logApiCall(method, path, duration, statusCode, metadata) {
        this.info(`API ${method} ${path} - ${statusCode} (${duration}ms)`, 'api', {
            method,
            path,
            duration,
            statusCode,
            ...metadata
        });
    }
    // Log de queries do banco
    logDatabaseQuery(query, duration, success, metadata) {
        const level = success ? 'info' : 'error';
        this[level](`Database query ${success ? 'completed' : 'failed'} (${duration}ms)`, 'database', {
            query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
            duration,
            success,
            ...metadata
        });
    }
}
exports.ProductionLogger = ProductionLogger;
// Singleton logger instance
exports.logger = new ProductionLogger();
// Middleware para capturar métricas de API
function createApiMetricsMiddleware() {
    return (req, res, next) => {
        const start = Date.now();
        const path = req.path;
        const method = req.method;
        // Capturar a resposta
        const originalSend = res.send;
        res.send = function (data) {
            const duration = Date.now() - start;
            // Log apenas para rotas de API
            if (path.startsWith('/api')) {
                exports.logger.logApiCall(method, path, duration, res.statusCode, {
                    userAgent: req.get('User-Agent'),
                    ip: req.ip,
                    responseSize: data ? data.length : 0
                });
            }
            return originalSend.call(this, data);
        };
        next();
    };
}
async function getHealthStatus() {
    const start = Date.now();
    let dbConnected = false;
    let dbError;
    try {
        // Testar conexão com banco
        const { prisma } = await Promise.resolve().then(() => __importStar(require('./db')));
        await prisma.$queryRaw `SELECT 1`;
        dbConnected = true;
    }
    catch (error) {
        dbError = error instanceof Error ? error.message : 'Unknown database error';
    }
    const dbResponseTime = Date.now() - start;
    const memoryUsage = process.memoryUsage();
    return {
        status: dbConnected ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        database: {
            connected: dbConnected,
            responseTime: dbResponseTime,
            error: dbError
        },
        memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            free: Math.round((memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        }
    };
}
