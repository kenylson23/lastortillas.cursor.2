import { defineConfig } from "drizzle-kit";

// Para migrações, usar URL direta do banco (não pooler)
const DATABASE_URL = process.env.SUPABASE_DB_DIRECT_URL || process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("SUPABASE_DB_DIRECT_URL or SUPABASE_DB_URL is required. Please set up your Supabase project.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
  // Configurações específicas para pooler
  verbose: true,
  strict: false,
});
