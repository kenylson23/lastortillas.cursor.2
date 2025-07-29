import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";
import { supabase } from '../shared/supabase';

// Use Supabase database connection string from environment
const DATABASE_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'password'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'postgres'}`;

console.log('Connecting to database with URL:', DATABASE_URL.replace(/:([^:@]+)@/, ':***@'));

// Create connection using postgres-js with pooler-specific settings
const sql = postgres(DATABASE_URL, {
  max: 10, // Reduzido para pooler
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  ssl: 'require', // Necessário para pooler
  connection: {
    application_name: 'lastortilhas-mx'
  }
});

export const db = drizzle(sql, { schema });

// Export Supabase client for direct use
export { supabase };