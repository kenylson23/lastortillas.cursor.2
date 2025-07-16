import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupHealthEndpoints } from "./health-endpoint";
import { setupVite, serveStatic, log } from "./vite";
import { testDatabaseConnection, checkDatabaseHealth } from "./db";
import { validateSupabaseConfig } from "./supabase-config";
import { databaseMonitor } from "./database-health";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from attached_assets
app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

// Serve static files from public directory (only for uploads and images)
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Validar configuração do Supabase
  console.log('🔍 Validando configuração do Supabase...');
  const configValidation = validateSupabaseConfig();
  if (!configValidation.valid) {
    console.error('❌ Configuração inválida:', configValidation.errors);
  } else {
    console.log('✅ Configuração do Supabase válida');
  }

  // Testar conexão com banco de dados
  console.log('🔗 Testando conexão com banco de dados...');
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.error('💥 Falha crítica na conexão com banco de dados');
    process.exit(1);
  }

  // Verificar saúde inicial do banco
  const healthCheck = await checkDatabaseHealth();
  console.log('📊 Status inicial do banco:', {
    connected: healthCheck.connected,
    version: healthCheck.version?.substring(0, 50) + '...' || 'N/A'
  });

  // Iniciar monitoramento de saúde em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    databaseMonitor.startMonitoring(60000); // A cada 1 minuto
  }

  const server = await registerRoutes(app);

  // Configurar endpoints de saúde
  setupHealthEndpoints(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
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
    log(`serving on port ${port}`);
  });
})();
