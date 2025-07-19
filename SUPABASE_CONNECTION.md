# Conexão com Supabase

## Status Atual
- ✅ Projeto migrado com sucesso do Prisma ORM para Drizzle ORM
- ✅ Banco PostgreSQL local funcionando perfeitamente
- ✅ Drizzle ORM funcionando perfeitamente
- ✅ Sistema totalmente conectado ao PostgreSQL via Drizzle

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
npm run db:push
```

### Passo 3: Migrar Dados
```bash
npx tsx -e "
import { fullMigrationToSupabase } from './server/supabase-migration';
fullMigrationToSupabase();
"
```

## Status Final
✅ **SUCESSO!** O projeto está funcionando perfeitamente com Supabase Connection Pooling!

### Configuração Atual
- **Database**: Supabase PostgreSQL via Connection Pooling
- **URL**: aws-0-us-east-1.pooler.supabase.com:5432
- **Status**: Totalmente operacional
- **Migração**: Concluída com sucesso
- **Dados**: Inseridos e funcionando

### Próximos Passos
O sistema está pronto para produção com Supabase. Todas as funcionalidades estão operacionais:
- ✅ Menu items
- ✅ Orders
- ✅ Reservations
- ✅ Tables
- ✅ Contacts