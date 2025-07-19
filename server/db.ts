import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// Use PostgreSQL database connection string from environment
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/postgres';

// Create connection using postgres-js for better compatibility
const sql = postgres(DATABASE_URL);

export const db = drizzle(sql, { schema });