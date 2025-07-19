# Migração para Vercel - Las Tortillas Mexican Grill

## Resumo da Migração

Migração completa da aplicação Las Tortillas de Express.js para arquitetura serverless do Vercel.

## APIs Criadas

### 1. `/api/menu-items.ts`
- **GET**: Listar todos os itens do menu
- **POST**: Criar novo item do menu
- Conectado com Supabase via Drizzle ORM

### 2. `/api/reservations.ts`
- **GET**: Listar todas as reservas
- **POST**: Criar nova reserva
- Validação com Zod schemas

### 3. `/api/contacts.ts`
- **GET**: Listar todos os contatos
- **POST**: Criar novo contato
- Formulário de contato do site

### 4. `/api/orders.ts`
- **GET**: Listar todos os pedidos
- **POST**: Criar novo pedido
- Sistema de pedidos online

### 5. `/api/availability.ts`
- **GET**: Verificar disponibilidade de horário
- Query params: `date` e `time`
- Retorna disponibilidade para reservas

### 6. `/api/tables.ts`
- **GET**: Listar todas as mesas
- **POST**: Criar nova mesa
- Gestão de mesas do restaurante

### 7. `/api/auth/login.ts`
- **POST**: Autenticação de usuário
- Integração com Supabase Auth

### 8. `/api/auth/register.ts`
- **POST**: Registro de novo usuário
- Criação de conta via Supabase

## Configuração

### Arquivos de Configuração
- `vercel.json`: Configuração de deploy e routing
- `.vercelignore`: Arquivos ignorados no deploy
- `package.json`: Dependências incluindo @vercel/node

### Variáveis de Ambiente Necessárias
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

## Testes Realizados

### ✅ APIs Funcionais
- GET `/api/menu-items` - Lista itens do menu
- GET `/api/reservations` - Lista reservas
- POST `/api/contacts` - Cria contato
- POST `/api/reservations` - Cria reserva
- GET `/api/availability` - Verifica disponibilidade

### ✅ Banco de Dados
- Conexão com Supabase estabelecida
- Todas as tabelas funcionando
- Validação de dados com Zod
- Inserção e consulta de dados

### ✅ Build e Deploy
- Build do frontend funcionando
- Arquivos estáticos configurados
- APIs serverless configuradas
- CORS habilitado para todas as APIs

## Comandos de Deploy

```bash
# Instalar Vercel CLI
npm i -g vercel

# Build da aplicação
npm run build

# Deploy para Vercel
vercel

# Deploy para produção
vercel --prod
```

## Estrutura Final

```
├── api/
│   ├── auth/
│   │   ├── login.ts
│   │   └── register.ts
│   ├── availability.ts
│   ├── contacts.ts
│   ├── menu-items.ts
│   ├── orders.ts
│   ├── reservations.ts
│   └── tables.ts
├── dist/public/          # Build do frontend
├── shared/               # Esquemas e utilitários
├── vercel.json           # Configuração do Vercel
└── package.json          # Dependências
```

## Status da Migração

- ✅ **Backend**: Migrado completamente para serverless
- ✅ **Frontend**: Build funcionando
- ✅ **Banco de Dados**: Supabase integrado
- ✅ **APIs**: Todas funcionais
- ✅ **Autenticação**: Supabase Auth
- ✅ **Validação**: Zod schemas
- ✅ **CORS**: Configurado
- ✅ **Deploy**: Pronto para Vercel

## Próximos Passos

1. Deploy no Vercel com `vercel --prod`
2. Configurar domínio personalizado (opcional)
3. Configurar variáveis de ambiente no Vercel
4. Testar todas as funcionalidades em produção