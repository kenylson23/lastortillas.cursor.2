/**
 * Endpoint de saúde do sistema para monitoramento
 */

import { Express } from 'express';
import { getHealthStatus } from './monitoring';

export function setupHealthEndpoints(app: Express) {
  // Endpoint de saúde simples
  app.get('/health', async (req, res) => {
    try {
      const health = await getHealthStatus();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Endpoint de saúde da API
  app.get('/api/health', async (req, res) => {
    try {
      const health = await getHealthStatus();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Endpoint de verificação rápida
  app.get('/ping', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'Las Tortillas API'
    });
  });
}