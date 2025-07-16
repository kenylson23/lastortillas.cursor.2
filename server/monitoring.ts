/**
 * Sistema de monitoramento para produção Vercel
 * Implementa logs estruturados e métricas de performance
 */

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source: string;
  metadata?: Record<string, any>;
  environment: string;
  requestId?: string;
}

export class ProductionLogger {
  private environment: string;
  private isProduction: boolean;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.isProduction = this.environment === 'production' || Boolean(process.env.VERCEL);
  }

  private createLogEntry(level: LogEntry['level'], message: string, source: string, metadata?: Record<string, any>): LogEntry {
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

  info(message: string, source = 'app', metadata?: Record<string, any>) {
    const entry = this.createLogEntry('info', message, source, metadata);
    
    if (this.isProduction) {
      console.log(JSON.stringify(entry));
    } else {
      const timestamp = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      console.log(`${timestamp} [${source}] ${message}`);
    }
  }

  warn(message: string, source = 'app', metadata?: Record<string, any>) {
    const entry = this.createLogEntry('warn', message, source, metadata);
    
    if (this.isProduction) {
      console.warn(JSON.stringify(entry));
    } else {
      console.warn(`⚠️  ${message}`);
    }
  }

  error(message: string, source = 'app', error?: Error, metadata?: Record<string, any>) {
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
    } else {
      console.error(`❌ ${message}`, error);
    }
  }

  // Métricas de performance para APIs
  logApiCall(method: string, path: string, duration: number, statusCode: number, metadata?: Record<string, any>) {
    this.info(`API ${method} ${path} - ${statusCode} (${duration}ms)`, 'api', {
      method,
      path,
      duration,
      statusCode,
      ...metadata
    });
  }

  // Log de queries do banco
  logDatabaseQuery(query: string, duration: number, success: boolean, metadata?: Record<string, any>) {
    const level = success ? 'info' : 'error';
    this[level](`Database query ${success ? 'completed' : 'failed'} (${duration}ms)`, 'database', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration,
      success,
      ...metadata
    });
  }
}

// Singleton logger instance
export const logger = new ProductionLogger();

// Middleware para capturar métricas de API
export function createApiMetricsMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const path = req.path;
    const method = req.method;

    // Capturar a resposta
    const originalSend = res.send;
    res.send = function(data: any) {
      const duration = Date.now() - start;
      
      // Log apenas para rotas de API
      if (path.startsWith('/api')) {
        logger.logApiCall(method, path, duration, res.statusCode, {
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

// Health check melhorado
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  database: {
    connected: boolean;
    responseTime: number;
    error?: string;
  };
  memory: {
    used: number;
    free: number;
    total: number;
  };
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const start = Date.now();
  let dbConnected = false;
  let dbError: string | undefined;
  
  try {
    // Testar conexão com banco
    const { prisma } = await import('./db');
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (error) {
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