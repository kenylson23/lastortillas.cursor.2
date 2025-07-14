import { testDatabaseConnection } from './db';

export interface DatabaseConfig {
  useSupabase: boolean;
  connectionString: string;
  provider: 'local' | 'supabase';
}

export async function getDatabaseConfig(): Promise<DatabaseConfig> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ROLE;
  const supabaseDbUrl = process.env.DATABASE_URL; // Original Supabase connection string
  
  const localDbUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

  // Try Supabase first if credentials are available
  if (supabaseUrl && supabaseKey && supabaseDbUrl) {
    console.log('Testing Supabase connection...');
    // For now, we'll use local database since Supabase direct connection is not working
    // In future, we can implement REST API fallback here
  }

  // Use local database as primary
  console.log('Using local PostgreSQL database');
  return {
    useSupabase: false,
    connectionString: localDbUrl,
    provider: 'local'
  };
}

export async function initializeDatabase(): Promise<void> {
  const config = await getDatabaseConfig();
  console.log(`Database initialized with provider: ${config.provider}`);
  
  // Test connection
  const connected = await testDatabaseConnection();
  if (!connected) {
    throw new Error('Failed to connect to database');
  }
}