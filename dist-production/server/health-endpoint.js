"use strict";
/**
 * Endpoint de saúde do sistema para monitoramento
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupHealthEndpoints = setupHealthEndpoints;
const monitoring_1 = require("./monitoring");
function setupHealthEndpoints(app) {
    // Endpoint de saúde simples
    app.get('/health', async (req, res) => {
        try {
            const health = await (0, monitoring_1.getHealthStatus)();
            const statusCode = health.status === 'healthy' ? 200 : 503;
            res.status(statusCode).json(health);
        }
        catch (error) {
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
            const health = await (0, monitoring_1.getHealthStatus)();
            const statusCode = health.status === 'healthy' ? 200 : 503;
            res.status(statusCode).json(health);
        }
        catch (error) {
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
