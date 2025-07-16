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
exports.testDatabaseConnection = testDatabaseConnection;
exports.checkDatabaseHealth = checkDatabaseHealth;
exports.cleanupIdleConnections = cleanupIdleConnections;
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const schema = __importStar(require("../shared/schema"));
const supabase_config_1 = require("./supabase-config");
// Database connection
const config = (0, supabase_config_1.getSupabaseConfig)();
const connectionString = config.databaseUrl;
if (!connectionString) {
    throw new Error('Database URL not found in Supabase configuration');
}
// Create postgres client with optimized configuration
const client = (0, postgres_1.default)(connectionString, {
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
    max: 10, // Maximum number of connections
    idle_timeout: 20, // Close connections after 20 seconds of inactivity
    connect_timeout: 10, // Connection timeout
});
// Create Drizzle instance
exports.db = (0, postgres_js_1.drizzle)(client, { schema });
// Test database connection
async function testDatabaseConnection(retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await client `SELECT 1`;
            console.log('✅ Database connection successful');
            return true;
        }
        catch (error) {
            console.log(`❌ Database connection failed (attempt ${i + 1}/${retries}):`, error);
            if (i === retries - 1)
                return false;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return false;
}
// Database health check
async function checkDatabaseHealth() {
    try {
        const result = await client `SELECT version()`;
        return {
            connected: true,
            version: result[0]?.version || 'Unknown',
        };
    }
    catch (error) {
        return {
            connected: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
// Graceful shutdown
async function cleanupIdleConnections() {
    try {
        await client.end();
        console.log('✅ Database connections closed');
    }
    catch (error) {
        console.error('❌ Error closing database connections:', error);
    }
}
