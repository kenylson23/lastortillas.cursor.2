/**
 * Endpoint de saúde do sistema para monitoramento
 */

import type { Express } from "express";
import { checkDatabaseHealth } from "./db";
import { databaseMonitor } from "./database-health";
import { validateSupabaseConfig } from "./supabase-config";

export function setupHealthEndpoints(app: Express) {
  // Endpoint básico de saúde
  app.get("/api/health", async (req, res) => {
    try {
      const startTime = Date.now();
      const dbHealth = await checkDatabaseHealth();
      const responseTime = Date.now() - startTime;
      
      const health = {
        status: dbHealth.connected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: dbHealth.connected,
          responseTime: responseTime + 'ms',
          version: dbHealth.version?.substring(0, 50) || 'N/A',
          error: dbHealth.error || null
        },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development'
        }
      };

      const statusCode = dbHealth.connected ? 200 : 503;
      res.status(statusCode).json(health);
      
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Endpoint detalhado de métricas (admin apenas)
  app.get("/api/health/metrics", async (req, res) => {
    try {
      const metrics = databaseMonitor.getMetrics();
      const latestMetric = databaseMonitor.getLatestMetric();
      const avgResponseTime = databaseMonitor.getAverageResponseTime();
      const isHealthy = databaseMonitor.isHealthy();
      
      const configValidation = validateSupabaseConfig();
      
      res.json({
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        configuration: {
          valid: configValidation.valid,
          errors: configValidation.errors
        },
        metrics: {
          latest: latestMetric,
          averageResponseTime: avgResponseTime,
          totalChecks: metrics.length,
          isHealthy
        },
        history: metrics.slice(-10) // Últimas 10 métricas
      });
      
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Endpoint para relatório de saúde
  app.get("/api/health/report", async (req, res) => {
    try {
      const report = await databaseMonitor.generateHealthReport();
      
      res.type('text/plain').send(report);
      
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Endpoint para forçar verificação de saúde
  app.post("/api/health/check", async (req, res) => {
    try {
      const health = await databaseMonitor.checkHealth();
      
      res.json({
        status: 'check_completed',
        timestamp: new Date().toISOString(),
        result: health
      });
      
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  console.log('🏥 Endpoints de saúde configurados');
}