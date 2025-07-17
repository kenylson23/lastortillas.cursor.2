import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";
import { getDatabaseUrl } from "../shared/supabase";

// Use Supabase pooler connection string
const DATABASE_URL = getDatabaseUrl();

// Create connection using postgres-js for better compatibility
const sql = postgres(DATABASE_URL);

export const db = drizzle(sql, { schema });