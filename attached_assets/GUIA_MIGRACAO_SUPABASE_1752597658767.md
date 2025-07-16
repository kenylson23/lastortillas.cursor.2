# Guia Passo-a-Passo: Migração para Supabase

## Visão Geral

Este guia detalha o processo completo de migração de banco de dados para Supabase, baseado na experiência real do projeto CUCA Cerveja. Inclui configuração, migração de dados, autenticação e resolução de problemas comuns.

## 1. Preparação Inicial

### 1.1 Criar Conta no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub, Google ou email
4. Confirme seu email se necessário

### 1.2 Criar Novo Projeto
1. No dashboard, clique em "New Project"
2. Selecione sua organização
3. Preencha os dados:
   - **Nome do Projeto**: `cuca-cerveja-prod`
   - **Database Password**: Gere uma senha forte (salve em local seguro)
   - **Região**: Escolha mais próxima aos usuários (Brasil: `South America`)
4. Clique em "Create new project"
5. Aguarde 2-3 minutos para provisioning

### 1.3 Obter Credenciais
Após criação, vá para Settings > API:
- **Project URL**: `https://seuprojetoid.supabase.co`
- **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Vá para Settings > Database:
- **Connection String**: `postgresql://postgres:[SUA-SENHA]@[HOST]:[PORTA]/[DB]`

## 2. Configuração do Schema

### 2.1 Acessar SQL Editor
1. No dashboard Supabase, vá para "SQL Editor"
2. Clique em "New query"

### 2.2 Criar Tabelas Principais
Execute este SQL para criar as tabelas base:

```sql
-- Tabela de usuários administrativos
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários clientes
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens de contato
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos de analytics
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  event_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fotos de fãs
CREATE TABLE fan_photos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  status TEXT DEFAULT 'pending',
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 Criar Políticas RLS (Row Level Security)
Execute para configurar segurança:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_photos ENABLE ROW LEVEL SECURITY;

-- Política para produtos (público para leitura)
CREATE POLICY "Produtos visíveis publicamente" ON products
  FOR SELECT USING (is_active = true);

-- Política para mensagens de contato (inserção pública)
CREATE POLICY "Qualquer um pode enviar mensagem de contato" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Política para usuários (só o próprio usuário)
CREATE POLICY "Usuários podem ver seus próprios dados" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Política para pedidos (só o próprio usuário)
CREATE POLICY "Usuários podem ver seus próprios pedidos" ON orders
  FOR SELECT USING (auth.uid()::text = user_id::text);
```

## 3. Configuração da Aplicação

### 3.1 Instalar Dependências Supabase
```bash
npm install @supabase/supabase-js
```

### 3.2 Configurar Variáveis de Ambiente
Crie/atualize arquivo `.env.local`:

```env
# Supabase
SUPABASE_URL=https://seuprojetoid.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (para Drizzle ORM)
DATABASE_URL=postgresql://postgres:[SUA-SENHA]@[HOST]:[PORTA]/postgres

# JWT (para autenticação customizada)
JWT_SECRET=sua_chave_secreta_muito_forte_aqui

# Ambiente
NODE_ENV=development
```

### 3.3 Atualizar Configuração do Banco
Modifique `server/db.ts`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Verificar se DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está configurada");
}

console.log("Conectando ao banco Supabase...");

// Configurar cliente PostgreSQL
const client = postgres(process.env.DATABASE_URL, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});

export const db = drizzle(client, { schema });

// Testar conexão
try {
  await client`SELECT 1`;
  console.log("✅ Conexão com Supabase estabelecida");
} catch (error) {
  console.error("❌ Erro ao conectar com Supabase:", error);
}
```

## 4. Migração de Dados

### 4.1 Configurar Drizzle para Supabase
Atualize `drizzle.config.ts`:

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === "production" ? "require" : false
  },
  verbose: true,
  strict: true
} satisfies Config;
```

### 4.2 Gerar e Aplicar Migrações
```bash
# Gerar migration baseada no schema
npm run db:generate

# Aplicar migration ao banco Supabase
npm run db:push

# Verificar se aplicou corretamente
npm run db:studio
```

### 4.3 Popular Dados Iniciais
Crie `server/seed-supabase.ts`:

```typescript
import { db } from "./db";
import { products, adminUsers } from "@shared/schema";
import bcrypt from "bcrypt";

export async function seedSupabase() {
  try {
    console.log("🌱 Iniciando seed do Supabase...");
    
    // Criar usuário admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    await db.insert(adminUsers).values({
      id: "admin-1",
      username: "admin",
      email: "admin@cuca.ao",
      firstName: "Administrador",
      lastName: "CUCA",
      role: "admin"
    }).onConflictDoNothing();

    // Criar produtos exemplo
    await db.insert(products).values([
      {
        name: "CUCA Original",
        description: "A cerveja original de Angola",
        price: 150.00,
        category: "cerveja",
        stockQuantity: 100,
        imageUrl: "/images/cuca-original.jpg"
      },
      {
        name: "CUCA Preta",
        description: "Cerveja preta com sabor intenso",
        price: 180.00,
        category: "cerveja",
        stockQuantity: 80,
        imageUrl: "/images/cuca-preta.jpg"
      }
    ]).onConflictDoNothing();

    console.log("✅ Seed do Supabase concluído");
  } catch (error) {
    console.error("❌ Erro no seed:", error);
    throw error;
  }
}
```

Execute o seed:
```bash
npm run seed
```

## 5. Configuração de Autenticação

### 5.1 Habilitar Autenticação no Supabase
1. No dashboard, vá para "Authentication"
2. Em "Settings", configure:
   - **Site URL**: `http://localhost:5000` (dev) / `https://seudominio.com` (prod)
   - **Redirect URLs**: Adicione URLs permitidas
3. Em "Providers", habilite:
   - Email/Password ✅
   - Google (opcional)
   - GitHub (opcional)

### 5.2 Configurar Cliente Supabase
Crie `client/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Credenciais do Supabase não configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 5.3 Hook de Autenticação
Crie `client/src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };
}
```

## 6. Configuração para Produção

### 6.1 Variáveis de Ambiente no Vercel
```bash
# Via CLI
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
vercel env add JWT_SECRET

# Ou pelo dashboard Vercel em Settings > Environment Variables
```

### 6.2 Configurar Domínio no Supabase
1. No dashboard Supabase, vá para "Authentication > Settings"
2. Atualize:
   - **Site URL**: `https://seudominio.vercel.app`
   - **Redirect URLs**: 
     - `https://seudominio.vercel.app/auth/callback`
     - `https://seudominio.vercel.app/dashboard`

### 6.3 Configurar SSL
O Supabase já vem com SSL habilitado. Certifique-se de que sua conexão use `ssl: "require"` em produção.

## 7. Resolução de Problemas Comuns

### 7.1 Erro: "Connection timeout"
**Problema**: Conexão com Supabase falha.
**Soluções**:
```typescript
// Aumentar timeout
const client = postgres(process.env.DATABASE_URL, {
  connect_timeout: 30,
  idle_timeout: 20,
  max_lifetime: 60 * 30
});
```

### 7.2 Erro: "column does not exist"
**Problema**: Schema local diferente do Supabase.
**Soluções**:
1. Compare schema local com Supabase SQL Editor
2. Execute `npm run db:push` para sincronizar
3. Verifique nomes de colunas (snake_case vs camelCase)

### 7.3 Erro: "RLS policy violation"
**Problema**: Row Level Security bloqueando acesso.
**Soluções**:
```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'sua_tabela';

-- Temporariamente desabilitar RLS (só para teste)
ALTER TABLE sua_tabela DISABLE ROW LEVEL SECURITY;

-- Criar política mais permissiva
CREATE POLICY "política_temporária" ON sua_tabela FOR ALL USING (true);
```

### 7.4 Erro: "Auth session not found"
**Problema**: Token expirou ou inválido.
**Soluções**:
```typescript
// Verificar se token é válido
const { data: user, error } = await supabase.auth.getUser();
if (error) {
  // Redirecionar para login
  window.location.href = '/login';
}

// Renovar sessão automaticamente
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token renovado automaticamente');
  }
});
```

## 8. Monitoramento e Backup

### 8.1 Configurar Logs
No dashboard Supabase:
1. Vá para "Logs"
2. Configure alertas para:
   - Erros de autenticação
   - Queries lentas
   - Tentativas de acesso suspeitas

### 8.2 Backup Automático
O Supabase faz backup automático, mas para backup manual:
```sql
-- Exportar dados importantes
COPY products TO '/tmp/products_backup.csv' WITH CSV HEADER;
COPY users TO '/tmp/users_backup.csv' WITH CSV HEADER;
```

### 8.3 Monitorar Performance
```typescript
// Adicionar logging de queries lentas
const client = postgres(process.env.DATABASE_URL, {
  onnotice: (notice) => console.log('NOTICE:', notice),
  debug: process.env.NODE_ENV === 'development'
});
```

## 9. Checklist Final

### 9.1 Antes de Produção
- [ ] Todas as tabelas criadas no Supabase
- [ ] Políticas RLS configuradas adequadamente
- [ ] Variáveis de ambiente configuradas
- [ ] Autenticação testada
- [ ] Seed executado com sucesso
- [ ] Backup configurado

### 9.2 Validação Final
- [ ] Conexão com banco funcionando
- [ ] Login/logout funcionando
- [ ] Operações CRUD funcionando
- [ ] Políticas de segurança ativas
- [ ] Performance aceitável

## 10. Comandos Úteis

```bash
# Resetar banco (CUIDADO - apaga tudo)
npm run db:drop

# Regenerar schema
npm run db:generate

# Aplicar mudanças
npm run db:push

# Visualizar banco
npm run db:studio

# Verificar conexão
psql "postgresql://postgres:[SENHA]@[HOST]:[PORT]/postgres" -c "SELECT version();"
```

---

**Este guia cobre todo o processo de migração para Supabase baseado na experiência real do projeto CUCA Cerveja. Siga os passos na ordem para uma migração bem-sucedida.**