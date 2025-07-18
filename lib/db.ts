// Database connection utilities for Vercel serverless functions
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create connection pool for serverless functions
const pool = new Pool({
  connectionString: databaseUrl,
  max: 10, // Lower connection limit for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
});

// Create database connection
export const db = drizzle(pool, { schema });

// Export schema for convenience
export * from '../shared/schema';