import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// Use Supabase pooler connection string
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.nuoblhgwtxyrafbyxjkw:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

// Create connection using postgres-js for better compatibility
const sql = postgres(DATABASE_URL);

export const db = drizzle(sql, { schema });