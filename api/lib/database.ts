import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema';

// Environment variables for Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gqkofqfrfbqhhfstsfvz.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxa29mcWZyZmJxaGhmc3RzZnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA4NjczNzQsImV4cCI6MjAzNjQ0MzM3NH0.HYBBzfr5O5Th89B2Sj9VdnoZGwfVG1_O13fxfK8q4Ho';

// Database URL construction for postgres-js
const getDatabaseUrl = (): string => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  const password = process.env.SUPABASE_DB_PASSWORD || 'Akuila2507@';
  const supabaseId = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
  
  return `postgresql://postgres.${supabaseId}:${password}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;
};

// Create database connection for serverless
let dbConnection: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!dbConnection) {
    const connectionString = getDatabaseUrl();
    
    // Serverless-optimized postgres client
    const client = postgres(connectionString, {
      ssl: 'require',
      max: 1, // Single connection for serverless
      idle_timeout: 0, // No idle timeout
      connect_timeout: 30, // 30 second timeout
      prepare: false, // Disable prepared statements for compatibility
    });
    
    dbConnection = drizzle(client, { schema });
  }
  
  return dbConnection;
}

// Export database instance
export const db = getDatabase();