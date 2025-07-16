"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const health_endpoint_1 = require("./health-endpoint");
const vite_1 = require("./vite");
const db_1 = require("./db");
const supabase_config_1 = require("./supabase-config");
const database_health_1 = require("./database-health");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Serve static files from attached_assets
app.use('/attached_assets', express_1.default.static(path_1.default.join(process.cwd(), 'attached_assets')));
// Serve static files from public directory (only for uploads and images)
app.use('/images', express_1.default.static(path_1.default.join(process.cwd(), 'public', 'images')));
// Serve uploaded images
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'public', 'uploads')));
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            (0, vite_1.log)(logLine);
        }
    });
    next();
});
(async () => {
    // Validar configuração do Supabase
    console.log('🔍 Validando configuração do Supabase...');
    const configValidation = (0, supabase_config_1.validateSupabaseConfig)();
    if (!configValidation.valid) {
        console.error('❌ Configuração inválida:', configValidation.errors);
    }
    else {
        console.log('✅ Configuração do Supabase válida');
    }
    // Testar conexão com banco de dados
    console.log('🔗 Testando conexão com banco de dados...');
    const dbConnected = await (0, db_1.testDatabaseConnection)();
    if (!dbConnected) {
        console.error('💥 Falha crítica na conexão com banco de dados');
        process.exit(1);
    }
    // Verificar saúde inicial do banco
    const healthCheck = await (0, db_1.checkDatabaseHealth)();
    console.log('📊 Status inicial do banco:', {
        connected: healthCheck.connected,
        version: healthCheck.version?.substring(0, 50) + '...' || 'N/A'
    });
    // Iniciar monitoramento de saúde em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        database_health_1.databaseMonitor.startMonitoring(60000); // A cada 1 minuto
    }
    const server = await (0, routes_1.registerRoutes)(app);
    // Configurar endpoints de saúde
    (0, health_endpoint_1.setupHealthEndpoints)(app);
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        throw err;
    });
    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
        await (0, vite_1.setupVite)(app, server);
    }
    else {
        (0, vite_1.serveStatic)(app);
    }
    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
    }, () => {
        (0, vite_1.log)(`serving on port ${port}`);
    });
})();
