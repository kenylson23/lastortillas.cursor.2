import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cors from "cors";
import type { Request, Response } from "express";
import { registerRoutes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const isProduction = process.env.NODE_ENV === "production";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(join(__dirname, "../public/uploads")));

// API routes first
registerRoutes(app);

if (isProduction) {
  // In production, serve the built static files
  app.use(express.static(join(__dirname, "../dist/public")));
  
  // Serve React app for all other routes (client-side routing)
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(join(__dirname, "../dist/public/index.html"));
  });
} else {
  // In development, serve client files directly
  app.use(express.static(join(__dirname, "../client")));
  
  // Handle React router routes - non-API routes only
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(join(__dirname, "../client/index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`${isProduction ? 'Production' : 'Development'} server running on http://0.0.0.0:${PORT}`);
});