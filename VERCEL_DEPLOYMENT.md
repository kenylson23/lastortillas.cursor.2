# Las Tortillas - Vercel Deployment Guide

## Arquitetura Full-Stack no Vercel

Este projeto foi convertido para uma arquitetura full-stack completa no Vercel com:

### 🏗️ Estrutura do Projeto

```
├── src/                    # Frontend React (SPA)
├── api/                    # Serverless Functions (Backend)
│   ├── menu-items.ts      # CRUD menu items
│   ├── orders.ts          # CRUD orders 
│   ├── reservations.ts    # CRUD reservations
│   └── tables.ts          # CRUD tables
├── lib/                   # Utilities compartilhadas
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
├── shared/               # Schemas e tipos
│   └── schema.ts         # Drizzle database schemas
├── vercel.json          # Configuração Vercel
└── index.html           # Frontend entry point
```

### 🚀 Funcionalidades

**Backend (Serverless Functions):**
- ✅ CRUD completo para menu items
- ✅ Sistema de pedidos com tracking
- ✅ Gestão de reservas
- ✅ Gestão de mesas por localização
- ✅ Database PostgreSQL (Supabase/Neon)
- ✅ Validação com Zod schemas
- ✅ CORS configurado para frontend

**Frontend (React SPA):**
- ✅ Interface administrativa completa
- ✅ Sistema de pedidos online
- ✅ Menu showcase dinâmico
- ✅ Gestão de localizações
- ✅ Cart persistente
- ✅ Tracking de pedidos em tempo real

### 🔧 Configuração da Database

#### Opção 1: Supabase (Recomendado)
1. Vá para [Supabase Dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto
3. Copie a CONNECTION STRING do projeto
4. Configure a variável de ambiente `DATABASE_URL` no Vercel

#### Opção 2: Neon Database
1. Vá para [Neon Console](https://console.neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Configure no Vercel

### 📋 Steps para Deploy

#### 1. Preparar o Build
```bash
node build-vercel-full.mjs
```

#### 2. Deploy no Vercel
1. Faça push do código para GitHub
2. Conecte o repositório no Vercel
3. Configure a variável de ambiente:
   - `DATABASE_URL`: sua connection string do Supabase/Neon

#### 3. Primeira Execução
1. Execute as migrations da database:
```bash
npm run db:push
```

### 🛠️ Variáveis de Ambiente Necessárias

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

### 📡 API Endpoints

Todos os endpoints estão disponíveis em `/api/`:

- `GET/POST /api/menu-items` - Gestão do menu
- `GET/POST/PUT/DELETE /api/orders` - Sistema de pedidos
- `GET/POST /api/reservations` - Sistema de reservas
- `GET/POST/PUT/DELETE /api/tables` - Gestão de mesas

### 🔄 Integração Frontend-Backend

O frontend usa TanStack Query para comunicação com as APIs:

```typescript
// Exemplo de uso
const { data: menuItems } = useQuery({
  queryKey: ['/api/menu-items'],
});
```

### 🎯 Benefícios desta Arquitetura

1. **Escalabilidade Automática**: Serverless functions escalam automaticamente
2. **Performance**: Edge functions para baixa latência
3. **Custo-eficiente**: Pague apenas pelo que usar
4. **Database Persistente**: PostgreSQL para dados confiáveis
5. **Full-Stack**: Frontend + Backend em um só deploy
6. **Fácil Manutenção**: Separação clara entre frontend e backend

### 📱 Funcionalidades Mantidas

- ✅ Painel administrativo completo
- ✅ Sistema de pedidos online
- ✅ Gestão de mesas e localizações
- ✅ Tracking de pedidos em tempo real
- ✅ Cart persistente com localStorage
- ✅ Interface responsiva para mobile/desktop
- ✅ Integração WhatsApp para comunicação
- ✅ Upload de imagens para menu items
- ✅ Sistema de autenticação admin

### 🚨 Notas Importantes

1. **Database Schema**: Execute `npm run db:push` após deploy
2. **Imagens**: Configure storage para upload de imagens (Vercel Blob/Cloudinary)
3. **Environment Variables**: Configure `DATABASE_URL` no Vercel dashboard
4. **CORS**: Já configurado para comunicação frontend-backend

Este setup oferece uma solução completa, escalável e profissional para o restaurante Las Tortillas!