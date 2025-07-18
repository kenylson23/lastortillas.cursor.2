import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cors from "cors";
import type { Request, Response } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve uploaded files
app.use("/uploads", express.static(join(__dirname, "../public/uploads")));

// Serve client files directly
app.use(express.static(join(__dirname, "../client")));

// Handle React router routes
app.get("*", (req: Request, res: Response) => {
  res.sendFile(join(__dirname, "../client/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Simple server running on http://0.0.0.0:${PORT}`);
});