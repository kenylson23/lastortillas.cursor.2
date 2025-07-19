import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// Use PostgreSQL database connection string from environment
const DATABASE_URL = process.env.DATABASE_URL || `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'password'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'postgres'}`;

console.log('Connecting to database with URL:', DATABASE_URL.replace(/:([^:@]+)@/, ':***@'));

// Create connection using postgres-js for better compatibility
const sql = postgres(DATABASE_URL, {
  max: 20,
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

export const db = drizzle(sql, { schema });