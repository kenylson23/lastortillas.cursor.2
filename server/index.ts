import express from "express";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import path from "path";

// Minimal Express app for static SPA
const app = express();

// Serve static files from attached_assets
app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

(async () => {
  // Create HTTP server
  const server = createServer(app);

  // Setup Vite in development
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start the server
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port} (static SPA mode)`);
  });
})();