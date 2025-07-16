/**
 * Configuração avançada do Supabase seguindo as melhores práticas
 * Baseado no guia de migração para otimização de performance e segurança
 */

interface SupabaseConfig {
  projectUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  databaseUrl: string;
  isProduction: boolean;
  connectionConfig: {
    maxConnections: number;
    idleTimeout: number;
    connectTimeout: number;
    ssl: boolean | string;
  };
}

export function getSupabaseConfig(): SupabaseConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // URLs e chaves do Supabase
  const projectUrl = process.env.SUPABASE_URL || 'https://nuoblhgwtxyrafbyxjkw.supabase.co';
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  // Database URL com pool de conexões otimizado
  const databaseUrl = process.env.DATABASE_URL || 
    'postgresql://postgres.nuoblhgwtxyrafbyxjkw:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

  return {
    projectUrl,
    anonKey,
    serviceRoleKey,
    databaseUrl,
    isProduction,
    connectionConfig: {
      maxConnections: isProduction ? 20 : 10,
      idleTimeout: isProduction ? 30 : 20, // segundos
      connectTimeout: isProduction ? 30 : 10, // segundos
      ssl: isProduction ? 'require' : false
    }
  };
}

export function validateSupabaseConfig(): { valid: boolean; errors: string[] } {
  const config = getSupabaseConfig();
  const errors: string[] = [];
  
  if (!config.projectUrl) {
    errors.push('SUPABASE_URL não configurada');
  }
  
  if (!config.databaseUrl) {
    errors.push('DATABASE_URL não configurada');
  }
  
  if (config.isProduction) {
    if (!config.anonKey) {
      errors.push('SUPABASE_ANON_KEY necessária em produção');
    }
    if (!config.serviceRoleKey) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY necessária em produção');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Configurações de RLS (Row Level Security) recomendadas
export const RLS_POLICIES = {
  // Políticas para menu items (acesso público para leitura)
  menuItems: {
    read: "CREATE POLICY menu_items_read ON menu_items FOR SELECT USING (true);",
    admin_all: "CREATE POLICY menu_items_admin ON menu_items FOR ALL USING (auth.role() = 'authenticated');"
  },
  
  // Políticas para pedidos (usuários veem apenas seus pedidos)
  orders: {
    read: "CREATE POLICY orders_read ON orders FOR SELECT USING (auth.uid()::text = customer_phone);",
    insert: "CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (true);",
    admin_all: "CREATE POLICY orders_admin ON orders FOR ALL USING (auth.role() = 'authenticated');"
  },
  
  // Políticas para reservas (inserção pública, admin vê tudo)
  reservations: {
    insert: "CREATE POLICY reservations_insert ON reservations FOR INSERT WITH CHECK (true);",
    admin_all: "CREATE POLICY reservations_admin ON reservations FOR ALL USING (auth.role() = 'authenticated');"
  },
  
  // Políticas para contatos (inserção pública, admin vê tudo)
  contacts: {
    insert: "CREATE POLICY contacts_insert ON contacts FOR INSERT WITH CHECK (true);",
    admin_all: "CREATE POLICY contacts_admin ON contacts FOR ALL USING (auth.role() = 'authenticated');"
  },
  
  // Políticas para mesas (admin apenas)
  tables: {
    admin_all: "CREATE POLICY tables_admin ON tables FOR ALL USING (auth.role() = 'authenticated');"
  }
};

// Configuração de cache e performance
export const PERFORMANCE_CONFIG = {
  // Cache timeouts em milissegundos
  cacheTimeouts: {
    menuItems: 5 * 60 * 1000, // 5 minutos
    availability: 30 * 1000, // 30 segundos
    reservations: 2 * 60 * 1000, // 2 minutos
    orders: 1 * 60 * 1000 // 1 minuto
  },
  
  // Limites de rate limiting
  rateLimits: {
    general: { requests: 100, window: '15m' },
    auth: { requests: 10, window: '15m' },
    upload: { requests: 20, window: '1h' }
  },
  
  // Configurações de query
  queryConfig: {
    timeout: 30000, // 30 segundos
    retries: 3,
    retryDelay: 1000 // 1 segundo
  }
};

export default getSupabaseConfig;