import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import { getSupabaseConfig } from './supabase-config.js';

// Database connection
const config = getSupabaseConfig();
const connectionString = config.databaseUrl;

if (!connectionString) {
  throw new Error('Database URL not found in Supabase configuration');
}

// Create postgres client with optimized configuration
const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close connections after 20 seconds of inactivity
  connect_timeout: 10, // Connection timeout
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Test database connection
export async function testDatabaseConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await client`SELECT 1`;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.log(`❌ Database connection failed (attempt ${i + 1}/${retries}):`, error);
      if (i === retries - 1) return false;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  version?: string;
  error?: string;
}> {
  try {
    const result = await client`SELECT version()`;
    return {
      connected: true,
      version: result[0]?.version || 'Unknown',
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Graceful shutdown
export async function cleanupIdleConnections(): Promise<void> {
  try {
    await client.end();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
}