# Guia de Migração para Supabase

## Status Atual

✅ **Projeto Supabase configurado**
✅ **Tabelas principais criadas:**
- `menu_items` (6 registros)
- `orders` 
- `order_items`
- `reservations`
- `tables` (10 registros)
- `users`
- `sessions`

❌ **Tabela faltando:**
- `contacts`

## Passos para Completar a Migração

### 1. Criar Tabela Contacts

Execute o seguinte SQL no Supabase Dashboard (SQL Editor):

```sql
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### 2. Configurar Row Level Security (RLS)

Para cada tabela, execute:

```sql
-- Habilitar RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas (permitir leitura pública, escrita apenas para autenticados)
CREATE POLICY "Allow public read access" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON order_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access" ON reservations FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON reservations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON contacts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON contacts FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON tables FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON tables FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON users FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Supabase Configuration
SUPABASE_URL=https://seu-project-id.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Database URLs
SUPABASE_DB_DIRECT_URL=postgresql://postgres:[sua-senha]@db.[project-id].supabase.co:5432/postgres
SUPABASE_DB_URL=postgresql://postgres.[project-id]:[sua-senha]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Environment
NODE_ENV=production
```

### 4. Atualizar Configuração do Supabase

Verifique se o arquivo `shared/supabase.ts` está correto:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database URL configuration for PostgreSQL (fallback)
export const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || 'postgresql://localhost:5432/postgres';
};
```

### 5. Testar a Conexão

Execute o projeto localmente para testar:

```bash
npm run dev
```

### 6. Configurar Dados Iniciais

Insira alguns dados de exemplo no menu:

```sql
INSERT INTO menu_items (name, description, price, category, available) VALUES
('Tacos de Carne', 'Tacos tradicionais com carne assada', 12.50, 'Tacos', true),
('Quesadilla de Frango', 'Quesadilla recheada com frango grelhado', 15.00, 'Quesadillas', true),
('Guacamole', 'Guacamole fresco com chips', 8.00, 'Entradas', true),
('Margarita', 'Margarita tradicional', 10.00, 'Bebidas', true);
```

### 7. Configurar Mesas

```sql
INSERT INTO tables (location_id, table_number, seats, status, qr_code) VALUES
('ilha', 1, 4, 'available', 'table-ilha-1'),
('ilha', 2, 4, 'available', 'table-ilha-2'),
('ilha', 3, 6, 'available', 'table-ilha-3'),
('talatona', 1, 4, 'available', 'table-talatona-1'),
('talatona', 2, 4, 'available', 'table-talatona-2'),
('movel', 1, 2, 'available', 'table-movel-1'),
('movel', 2, 2, 'available', 'table-movel-2');
```

## Próximos Passos

1. ✅ Execute os comandos SQL acima no Supabase Dashboard
2. ✅ Configure as variáveis de ambiente
3. ✅ Teste a aplicação localmente
4. ✅ Faça deploy para produção

## Verificação Final

Após completar os passos, verifique se:

- [ ] Todas as tabelas foram criadas
- [ ] RLS está habilitado
- [ ] Políticas de segurança estão configuradas
- [ ] Aplicação conecta corretamente ao Supabase
- [ ] Dados de exemplo estão inseridos
- [ ] Funcionalidades principais funcionam

## Suporte

Se encontrar problemas, verifique:
- Logs do Supabase
- Configuração das variáveis de ambiente
- Permissões das políticas RLS
- Conexão de rede