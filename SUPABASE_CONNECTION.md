# Conexão com Supabase

## Status Atual
- ✅ Projeto migrado com sucesso do Drizzle ORM para Prisma ORM
- ✅ Banco PostgreSQL local funcionando perfeitamente
- ✅ Supabase REST API funcionando
- ❌ Conexão direta PostgreSQL do Supabase com problemas

## Problema Identificado
A conexão direta com o banco PostgreSQL do Supabase está falhando:
```
Error: P1001: Can't reach database server at `db.nuoblhgwtxyrafbyxjkw.supabase.co:5432`
```

## Possíveis Causas
1. **Projeto pausado**: Projetos Supabase gratuitos pausam após inatividade
2. **Configuração de firewall**: Supabase pode ter restrições de rede
3. **Configuração SSL**: Pode precisar de configuração SSL específica
4. **Credenciais**: Senha ou configuração pode estar incorreta

## Soluções para Testar

### 1. Verificar no Painel Supabase
- Acesse https://app.supabase.com/project/nuoblhgwtxyrafbyxjkw
- Vá em Settings → Database
- Verifique se o projeto está ativo e não pausado
- Copie a connection string mais recente

### 2. Testar Conexão SSL
Adicione parâmetros SSL na DATABASE_URL:
```
postgresql://postgres:Kenylson%4023@db.nuoblhgwtxyrafbyxjkw.supabase.co:5432/postgres?sslmode=require
```

### 3. Usar Connection Pooling
Se disponível, use a connection string do connection pooler:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### 4. Verificar Configurações de Rede
- Alguns ambientes podem bloquear conexões diretas PostgreSQL
- Pode ser necessário usar apenas REST API em alguns casos

## Migração para Supabase (Quando Conectar)

### Passo 1: Atualizar DATABASE_URL
```bash
# No arquivo server/db.ts, altere para usar Supabase
const databaseUrl = process.env.DATABASE_URL; // Supabase connection string
```

### Passo 2: Migrar Schema
```bash
npx prisma db push
```

### Passo 3: Migrar Dados
```bash
npx tsx -e "
import { fullMigrationToSupabase } from './server/supabase-migration';
fullMigrationToSupabase();
"
```

## Fallback Atual
O projeto está funcionando perfeitamente com PostgreSQL local como backup, garantindo que todas as funcionalidades estejam operacionais enquanto resolvemos a conexão do Supabase.