import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from attached_assets
app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

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
  // Create HTTP server
  const server = createServer(app);
  
  // Setup WebSocket server for real-time updates (only if not in development)
  let wss: any = null;
  const clients = new Set<any>();
  
  if (process.env.NODE_ENV !== 'development') {
    wss = new WebSocketServer({ server });
    
    wss.on('connection', (ws: any) => {
      clients.add(ws);
      log('New WebSocket client connected');
      
      ws.on('close', () => {
        clients.delete(ws);
        log('WebSocket client disconnected');
      });
      
      ws.on('error', (error: any) => {
        log(`WebSocket client error: ${error.message}`);
        clients.delete(ws);
      });
    });
  }
  
  // Function to broadcast updates to all connected clients
  global.broadcastUpdate = (type: string, data: any) => {
    if (process.env.NODE_ENV === 'development') {
      // In development, skip WebSocket broadcasting to avoid conflicts with Vite
      return;
    }
    
    const message = JSON.stringify({ type, data, timestamp: Date.now() });
    clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
        } catch (error) {
          log(`Error sending WebSocket message: ${error}`);
          clients.delete(client);
        }
      }
    });
  };
  
  await registerRoutes(app);

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
