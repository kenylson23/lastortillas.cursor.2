/**
 * Configuração otimizada do banco de dados para ambiente serverless
 * Baseado no guia de migração para Vercel
 */

import { PrismaClient } from '@prisma/client';
import { getSupabaseConfig } from './supabase-config';
import { logger } from './monitoring';

// Cache global para reutilização de conexões
declare global {
  var __prisma: PrismaClient | undefined;
}

// Configuração específica para serverless
function createPrismaClient(): PrismaClient {
  const config = getSupabaseConfig();
  const isServerless = Boolean(process.env.VERCEL);
  
  return new PrismaClient({
    datasources: {
      db: {
        url: config.databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
}

// Singleton pattern para conexões do banco
export const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Função para testar conexão otimizada para serverless
export async function testServerlessConnection(retries = 3): Promise<boolean> {
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - startTime;
      
      logger.info(`Database connection successful on attempt ${attempt}`, 'database', {
        duration,
        attempt,
        serverless: Boolean(process.env.VERCEL)
      });
      
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (attempt === retries) {
        logger.error(`Database connection failed after ${retries} attempts`, 'database', error as Error, {
          duration,
          attempts: retries,
          serverless: Boolean(process.env.VERCEL)
        });
        return false;
      }
      
      logger.warn(`Database connection attempt ${attempt} failed, retrying...`, 'database', {
        duration,
        attempt,
        error: (error as Error).message
      });
      
      // Backoff exponencial
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return false;
}

// Cleanup para ambiente serverless
export async function cleanupServerlessConnection(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database connection cleaned up', 'database');
  } catch (error) {
    logger.error('Error during database cleanup', 'database', error as Error);
  }
}

// Middleware para limpeza automática em serverless
export function createServerlessCleanupMiddleware() {
  return async (req: any, res: any, next: any) => {
    // Cleanup após resposta em ambiente serverless
    if (process.env.VERCEL) {
      res.on('finish', async () => {
        await cleanupServerlessConnection();
      });
    }
    
    next();
  };
}

// Configuração de timeout para queries em serverless
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 25000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Database query timeout')), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// Wrapper para queries com retry e timeout
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2,
  timeoutMs = 25000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(operation(), timeoutMs);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      logger.warn(`Database operation failed on attempt ${attempt}, retrying...`, 'database', {
        attempt,
        error: (error as Error).message
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Health check específico para serverless
export async function checkServerlessHealth(): Promise<{
  connected: boolean;
  responseTime: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, 5000);
    
    return {
      connected: true,
      responseTime: Date.now() - start
    };
  } catch (error) {
    return {
      connected: false,
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}