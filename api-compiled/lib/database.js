"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.createServerlessConnection = createServerlessConnection;
exports.getDatabase = getDatabase;
exports.closeConnection = closeConnection;
exports.testConnection = testConnection;
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const schema = __importStar(require("../../shared/schema"));
// Environment detection
const isVercel = Boolean(process.env.VERCEL);
const isProduction = process.env.NODE_ENV === 'production';
// Get database URL with serverless optimization
function getServerlessConfig() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is required for serverless deployment');
    }
    return {
        connectionString,
        isServerless: isVercel || isProduction,
        timeout: isVercel ? 10 : 30 // Shorter timeout for Vercel
    };
}
// Create unique database connection per request (serverless pattern)
function createServerlessConnection() {
    const config = getServerlessConfig();
    console.log(`🔗 Creating ${config.isServerless ? 'serverless' : 'development'} database connection`);
    // Serverless-optimized postgres client configuration
    const client = (0, postgres_1.default)(config.connectionString, {
        // CRITICAL: Disable connection pooling for serverless
        max: 1, // Single connection only
        idle_timeout: 0, // No idle timeout 
        connect_timeout: config.timeout, // Fast timeout for cold starts
        // Serverless compatibility settings
        prepare: false, // Disable prepared statements
        types: {}, // Disable type parsing for speed
        transform: undefined, // No transform functions
        // SSL configuration
        ssl: config.isServerless ? 'require' : false,
        // Performance optimizations
        fetch_types: false, // Skip type fetching
        publications: '', // No publications
        // Error handling
        onnotice: () => { }, // Disable notices for performance
        debug: !config.isServerless // Debug only in development
    });
    return (0, postgres_js_1.drizzle)(client, {
        schema,
        logger: !config.isServerless // Logging only in development
    });
}
// Singleton for development, unique per request for serverless
let devConnection = null;
function getDatabase() {
    const config = getServerlessConfig();
    if (config.isServerless) {
        // Create new connection for each serverless request
        return createServerlessConnection();
    }
    else {
        // Reuse connection in development
        if (!devConnection) {
            devConnection = createServerlessConnection();
        }
        return devConnection;
    }
}
// Connection cleanup for serverless (called at end of request)
async function closeConnection(db) {
    if (isVercel || isProduction) {
        try {
            // Force close connection for serverless
            await db.$client?.end?.();
        }
        catch (error) {
            // Ignore cleanup errors in serverless
            console.warn('⚠️ Connection cleanup warning:', error);
        }
    }
}
// Health check for database connection
async function testConnection() {
    const start = Date.now();
    try {
        const db = getDatabase();
        await db.execute('SELECT 1 as test');
        const latency = Date.now() - start;
        console.log(`✅ Database connection test successful (${latency}ms)`);
        return { success: true, latency };
    }
    catch (error) {
        const latency = Date.now() - start;
        console.error('❌ Database connection test failed:', error);
        return {
            success: false,
            latency,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
// Export default database instance (creates new connection in serverless)
exports.db = getDatabase();
