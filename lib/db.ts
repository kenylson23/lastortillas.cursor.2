import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

let db: ReturnType<typeof drizzle<typeof schema>>;

export function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // For serverless functions, use a connection pool
    const client = postgres(connectionString, {
      max: 1, // Limit connections for serverless
      idle_timeout: 20,
      max_lifetime: 60 * 30, // 30 minutes
    });

    db = drizzle(client, { schema });
  }

  return db;
}

export { schema };