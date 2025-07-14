import { PrismaClient } from '@prisma/client';

// Use local database for now due to Supabase connection issues
const localDbUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

console.log('Using local PostgreSQL database (Supabase ready for migration)');

if (!process.env.PGUSER || !process.env.PGHOST) {
  throw new Error(
    "PostgreSQL credentials must be set. Did you forget to provision a database?",
  );
}

// Create Prisma client instance
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: localDbUrl,
    },
  },
});

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});