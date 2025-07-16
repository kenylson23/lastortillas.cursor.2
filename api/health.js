var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db.ts
var db_exports = {};
__export(db_exports, {
  checkDatabaseHealth: () => checkDatabaseHealth,
  cleanupIdleConnections: () => cleanupIdleConnections,
  prisma: () => prisma,
  testDatabaseConnection: () => testDatabaseConnection
});
import { PrismaClient } from "@prisma/client";
async function testDatabaseConnection(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1 as connection_test`;
      console.log("\u2705 Conex\xE3o com Supabase estabelecida com sucesso");
      return true;
    } catch (error) {
      console.error(`\u274C Tentativa ${attempt}/${retries} falhou:`, error);
      if (attempt === retries) {
        console.error("\u{1F4A5} Falha cr\xEDtica na conex\xE3o com banco de dados");
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1e3));
    }
  }
  return false;
}
async function checkDatabaseHealth() {
  try {
    const [versionResult, uptimeResult] = await Promise.all([
      prisma.$queryRaw`SELECT version() as version`,
      prisma.$queryRaw`SELECT EXTRACT(EPOCH FROM (current_timestamp - pg_postmaster_start_time()))::text || ' segundos' as uptime`
    ]);
    return {
      connected: true,
      version: versionResult[0]?.version,
      uptime: uptimeResult[0]?.uptime
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}
async function cleanupIdleConnections() {
  try {
    await prisma.$queryRaw`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE state = 'idle' 
      AND state_change < current_timestamp - INTERVAL '10 minutes'
      AND pid != pg_backend_pid()
    `;
    console.log("\u{1F9F9} Conex\xF5es ociosas limpas");
  } catch (error) {
    console.warn("\u26A0\uFE0F Erro ao limpar conex\xF5es ociosas:", error);
  }
}
var supabasePoolerUrl, databaseUrl, prisma, gracefulShutdown;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    supabasePoolerUrl = `postgresql://postgres.nuoblhgwtxyrafbyxjkw:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;
    databaseUrl = process.env.DATABASE_URL || supabasePoolerUrl;
    console.log("\u{1F517} Conectando ao Supabase com configura\xE7\xE3o otimizada...");
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: process.env.NODE_ENV === "development" ? [
        { level: "warn", emit: "event" },
        { level: "error", emit: "event" }
      ] : ["error"],
      errorFormat: "pretty"
    });
    if (process.env.NODE_ENV === "development") {
      prisma.$on("warn", (e) => {
        console.log("\u26A0\uFE0F Prisma Warning:", e);
      });
      prisma.$on("error", (e) => {
        console.error("\u274C Prisma Error:", e);
      });
    }
    if (process.env.NODE_ENV === "production") {
      setInterval(cleanupIdleConnections, 30 * 60 * 1e3);
    }
    gracefulShutdown = async () => {
      console.log("\u{1F504} Iniciando shutdown graceful...");
      try {
        await prisma.$disconnect();
        console.log("\u2705 Desconectado do banco de dados");
      } catch (error) {
        console.error("\u274C Erro durante shutdown:", error);
      }
      process.exit(0);
    };
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
    process.on("beforeExit", gracefulShutdown);
  }
});

// server/monitoring.ts
var ProductionLogger = class {
  constructor() {
    this.environment = process.env.NODE_ENV || "development";
    this.isProduction = this.environment === "production" || Boolean(process.env.VERCEL);
  }
  createLogEntry(level, message, source, metadata) {
    return {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      message,
      source,
      metadata,
      environment: this.environment,
      requestId: process.env.VERCEL_TRACE_ID
    };
  }
  info(message, source = "app", metadata) {
    const entry = this.createLogEntry("info", message, source, metadata);
    if (this.isProduction) {
      console.log(JSON.stringify(entry));
    } else {
      const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      console.log(`${timestamp} [${source}] ${message}`);
    }
  }
  warn(message, source = "app", metadata) {
    const entry = this.createLogEntry("warn", message, source, metadata);
    if (this.isProduction) {
      console.warn(JSON.stringify(entry));
    } else {
      console.warn(`\u26A0\uFE0F  ${message}`);
    }
  }
  error(message, source = "app", error, metadata) {
    const entry = this.createLogEntry("error", message, source, {
      ...metadata,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : void 0
    });
    if (this.isProduction) {
      console.error(JSON.stringify(entry));
    } else {
      console.error(`\u274C ${message}`, error);
    }
  }
  // Métricas de performance para APIs
  logApiCall(method, path, duration, statusCode, metadata) {
    this.info(`API ${method} ${path} - ${statusCode} (${duration}ms)`, "api", {
      method,
      path,
      duration,
      statusCode,
      ...metadata
    });
  }
  // Log de queries do banco
  logDatabaseQuery(query, duration, success, metadata) {
    const level = success ? "info" : "error";
    this[level](`Database query ${success ? "completed" : "failed"} (${duration}ms)`, "database", {
      query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
      duration,
      success,
      ...metadata
    });
  }
};
var logger = new ProductionLogger();
async function getHealthStatus() {
  const start = Date.now();
  let dbConnected = false;
  let dbError;
  try {
    const { prisma: prisma2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    await prisma2.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Unknown database error";
  }
  const dbResponseTime = Date.now() - start;
  const memoryUsage = process.memoryUsage();
  return {
    status: dbConnected ? "healthy" : "degraded",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
    database: {
      connected: dbConnected,
      responseTime: dbResponseTime,
      error: dbError
    },
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      free: Math.round((memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
    }
  };
}

// api/health.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method === "GET") {
    try {
      const health = await getHealthStatus();
      const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 503 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({
        status: "error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
export {
  handler as default
};
