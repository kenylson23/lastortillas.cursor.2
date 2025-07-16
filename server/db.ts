import { PrismaClient } from '@prisma/client';

// Configuração otimizada de conexão com Supabase baseada no guia de migração
const supabasePoolerUrl = `postgresql://postgres.nuoblhgwtxyrafbyxjkw:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;

// Verificar se DATABASE_URL está configurada (fallback para URL local se necessário)
const databaseUrl = process.env.DATABASE_URL || supabasePoolerUrl;

console.log('🔗 Conectando ao Supabase com configuração otimizada...');

// Configuração robusta do Prisma Client com pool de conexões e timeouts
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' }
  ] : ['error'],
  errorFormat: 'pretty',
});

// Configurar event listeners para logs de desenvolvimento
if (process.env.NODE_ENV === 'development') {
  prisma.$on('warn', (e) => {
    console.log('⚠️ Prisma Warning:', e);
  });
  
  prisma.$on('error', (e) => {
    console.error('❌ Prisma Error:', e);
  });
}

// Função de teste de conexão com retry automático
export async function testDatabaseConnection(retries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1 as connection_test`;
      console.log('✅ Conexão com Supabase estabelecida com sucesso');
      return true;
    } catch (error) {
      console.error(`❌ Tentativa ${attempt}/${retries} falhou:`, error);
      
      if (attempt === retries) {
        console.error('💥 Falha crítica na conexão com banco de dados');
        return false;
      }
      
      // Aguardar antes da próxima tentativa (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  return false;
}

// Função para verificar saúde do banco
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  version?: string;
  uptime?: string;
  error?: string;
}> {
  try {
    const [versionResult, uptimeResult] = await Promise.all([
      prisma.$queryRaw<[{ version: string }]>`SELECT version() as version`,
      prisma.$queryRaw<[{ uptime: string }]>`SELECT EXTRACT(EPOCH FROM (current_timestamp - pg_postmaster_start_time()))::text || ' segundos' as uptime`
    ]);
    
    return {
      connected: true,
      version: versionResult[0]?.version,
      uptime: uptimeResult[0]?.uptime
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para limpeza de conexões ociosas
export async function cleanupIdleConnections(): Promise<void> {
  try {
    await prisma.$queryRaw`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE state = 'idle' 
      AND state_change < current_timestamp - INTERVAL '10 minutes'
      AND pid != pg_backend_pid()
    `;
    console.log('🧹 Conexões ociosas limpas');
  } catch (error) {
    console.warn('⚠️ Erro ao limpar conexões ociosas:', error);
  }
}

// Configurar limpeza automática de conexões ociosas (a cada 30 minutos)
if (process.env.NODE_ENV === 'production') {
  setInterval(cleanupIdleConnections, 30 * 60 * 1000);
}

// Tratamento robusto de shutdown
const gracefulShutdown = async () => {
  console.log('🔄 Iniciando shutdown graceful...');
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados');
  } catch (error) {
    console.error('❌ Erro durante shutdown:', error);
  }
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);