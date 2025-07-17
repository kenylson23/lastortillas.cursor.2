import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema';

/**
 * SERVERLESS DATABASE CONFIGURATION
 * Optimized for Vercel serverless functions with unique connections per request
 * No connection pooling to prevent cold start issues and connection limit errors
 */

interface ServerlessDbConfig {
  connectionString: string;
  isServerless: boolean;
  timeout: number;
}

// Environment detection
const isVercel = Boolean(process.env.VERCEL);
const isProduction = process.env.NODE_ENV === 'production';

// Get database URL with serverless optimization
function getServerlessConfig(): ServerlessDbConfig {
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
export function createServerlessConnection() {
  const config = getServerlessConfig();
  
  console.log(`🔗 Creating ${config.isServerless ? 'serverless' : 'development'} database connection`);
  
  // Serverless-optimized postgres client configuration
  const client = postgres(config.connectionString, {
    // CRITICAL: Disable connection pooling for serverless
    max: 1,                    // Single connection only
    idle_timeout: 0,           // No idle timeout 
    connect_timeout: config.timeout, // Fast timeout for cold starts
    
    // Serverless compatibility settings
    prepare: false,            // Disable prepared statements
    types: {},                 // Disable type parsing for speed
    transform: undefined,      // No transform functions
    
    // SSL configuration
    ssl: config.isServerless ? 'require' : false,
    
    // Performance optimizations
    fetch_types: false,        // Skip type fetching
    publications: '',          // No publications
    
    // Error handling
    onnotice: () => {},        // Disable notices for performance
    debug: !config.isServerless // Debug only in development
  });
  
  return drizzle(client, { 
    schema,
    logger: !config.isServerless // Logging only in development
  });
}

// Singleton for development, unique per request for serverless
let devConnection: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  const config = getServerlessConfig();
  
  if (config.isServerless) {
    // Create new connection for each serverless request
    return createServerlessConnection();
  } else {
    // Reuse connection in development
    if (!devConnection) {
      devConnection = createServerlessConnection();
    }
    return devConnection;
  }
}

// Connection cleanup for serverless (called at end of request)
export async function closeConnection(db: ReturnType<typeof drizzle>) {
  if (isVercel || isProduction) {
    try {
      // Force close connection for serverless
      await (db as any).$client?.end?.();
    } catch (error) {
      // Ignore cleanup errors in serverless
      console.warn('⚠️ Connection cleanup warning:', error);
    }
  }
}

// Health check for database connection
export async function testConnection(): Promise<{ success: boolean; latency: number; error?: string }> {
  const start = Date.now();
  
  try {
    const db = getDatabase();
    await db.execute('SELECT 1 as test');
    
    const latency = Date.now() - start;
    console.log(`✅ Database connection test successful (${latency}ms)`);
    
    return { success: true, latency };
  } catch (error) {
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
export const db = getDatabase();