/**
 * Sistema de monitoramento e saúde do banco de dados
 * Implementa verificações automáticas e diagnósticos
 */

import { prisma, checkDatabaseHealth } from './db';

interface HealthMetrics {
  timestamp: Date;
  connected: boolean;
  responseTime: number;
  activeConnections?: number;
  slowQueries?: number;
  errors?: string[];
}

class DatabaseHealthMonitor {
  private metrics: HealthMetrics[] = [];
  private maxMetricsHistory = 100;
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  async checkHealth(): Promise<HealthMetrics> {
    const startTime = Date.now();
    
    try {
      const health = await checkDatabaseHealth();
      const responseTime = Date.now() - startTime;
      
      // Verificar conexões ativas
      const connectionsResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM pg_stat_activity 
        WHERE state = 'active' AND pid != pg_backend_pid()
      `;
      
      // Verificar queries lentas (mais de 5 segundos)
      const slowQueriesResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM pg_stat_activity 
        WHERE state = 'active' 
        AND query_start < current_timestamp - INTERVAL '5 seconds'
        AND pid != pg_backend_pid()
      `;
      
      const metrics: HealthMetrics = {
        timestamp: new Date(),
        connected: health.connected,
        responseTime,
        activeConnections: Number(connectionsResult[0]?.count || 0),
        slowQueries: Number(slowQueriesResult[0]?.count || 0),
        errors: health.error ? [health.error] : []
      };
      
      this.addMetric(metrics);
      return metrics;
      
    } catch (error) {
      const metrics: HealthMetrics = {
        timestamp: new Date(),
        connected: false,
        responseTime: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
      
      this.addMetric(metrics);
      return metrics;
    }
  }

  private addMetric(metric: HealthMetrics): void {
    this.metrics.push(metric);
    
    // Manter apenas os últimos N métricas
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }
  }

  getMetrics(): HealthMetrics[] {
    return [...this.metrics];
  }

  getLatestMetric(): HealthMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getAverageResponseTime(minutes = 15): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    if (recentMetrics.length === 0) return 0;
    
    const total = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return Math.round(total / recentMetrics.length);
  }

  isHealthy(): boolean {
    const latest = this.getLatestMetric();
    if (!latest) return false;
    
    return (
      latest.connected &&
      latest.responseTime < 5000 && // Menos de 5 segundos
      (latest.activeConnections || 0) < 50 && // Menos de 50 conexões ativas
      (latest.slowQueries || 0) < 5 // Menos de 5 queries lentas
    );
  }

  startMonitoring(intervalMs = 60000): void { // A cada 1 minuto por padrão
    if (this.isMonitoring) {
      console.log('⚠️ Monitoramento já está ativo');
      return;
    }
    
    this.isMonitoring = true;
    console.log('🔍 Iniciando monitoramento de saúde do banco de dados');
    
    this.monitoringInterval = setInterval(async () => {
      try {
        const health = await this.checkHealth();
        
        if (!health.connected) {
          console.error('🚨 ALERTA: Banco de dados desconectado!', health.errors);
        } else if (health.responseTime > 10000) {
          console.warn('⚠️ ALERTA: Resposta lenta do banco:', health.responseTime + 'ms');
        } else if ((health.slowQueries || 0) > 10) {
          console.warn('⚠️ ALERTA: Muitas queries lentas:', health.slowQueries);
        }
        
      } catch (error) {
        console.error('❌ Erro no monitoramento:', error);
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('⏹️ Monitoramento de saúde parado');
  }

  async generateHealthReport(): Promise<string> {
    const latest = this.getLatestMetric();
    const avgResponseTime = this.getAverageResponseTime();
    const isHealthy = this.isHealthy();
    
    return `
📊 RELATÓRIO DE SAÚDE DO BANCO DE DADOS
=====================================
Status: ${isHealthy ? '✅ Saudável' : '❌ Com problemas'}
Conectado: ${latest?.connected ? 'Sim' : 'Não'}
Tempo de resposta atual: ${latest?.responseTime || 0}ms
Tempo médio (15min): ${avgResponseTime}ms
Conexões ativas: ${latest?.activeConnections || 0}
Queries lentas: ${latest?.slowQueries || 0}
Últimos erros: ${latest?.errors?.join(', ') || 'Nenhum'}
Timestamp: ${latest?.timestamp?.toISOString() || 'N/A'}
=====================================
    `.trim();
  }

  // Função de auto-recuperação
  async attemptRecovery(): Promise<boolean> {
    console.log('🔄 Tentando recuperação automática...');
    
    try {
      // Tentar reconectar
      await prisma.$disconnect();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await prisma.$connect();
      
      // Verificar se recuperou
      const health = await this.checkHealth();
      if (health.connected) {
        console.log('✅ Recuperação bem-sucedida');
        return true;
      }
      
    } catch (error) {
      console.error('❌ Falha na recuperação:', error);
    }
    
    return false;
  }
}

// Instância singleton
export const databaseMonitor = new DatabaseHealthMonitor();

// Iniciar monitoramento em produção
if (process.env.NODE_ENV === 'production') {
  databaseMonitor.startMonitoring(30000); // A cada 30 segundos em produção
}

export default databaseMonitor;