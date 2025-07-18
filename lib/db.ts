// Database connection utilities for Vercel serverless functions
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create connection
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

// Export schema for convenience
export * from '../shared/schema';