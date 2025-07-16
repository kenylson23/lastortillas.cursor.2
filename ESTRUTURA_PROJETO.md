# 📁 Estrutura de Arquivos - Las Tortillas

## 🏗️ Organização Atual

```
projeto/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── lib/           # Utilitários e configurações
│   │   └── styles/        # Estilos CSS
│   ├── index.html         # Template HTML
│   └── public/            # Assets do cliente
├── server/                 # Backend Express (desenvolvimento)
│   ├── index.ts           # Servidor principal
│   ├── routes.ts          # Rotas da API
│   ├── auth.ts            # Autenticação
│   ├── storage.ts         # Camada de dados
│   └── db.ts              # Configuração do banco
├── shared/                 # Schemas e tipos compartilhados
│   └── schema.ts          # Definições Prisma
├── api/                    # Rotas serverless para Vercel
│   ├── auth.ts            # Autenticação serverless
│   ├── menu.ts            # Gestão do menu
│   ├── restaurant.ts      # Pedidos, reservas, contatos
│   ├── tables.ts          # Gestão de mesas
│   ├── health.ts          # Monitoramento
│   └── index.ts           # Endpoint principal
├── public/                 # Assets estáticos
│   ├── uploads/           # Imagens do menu
│   └── favicon.ico        # Ícone do site
├── prisma/                # Configuração do banco
│   └── schema.prisma      # Schema do banco
├── attached_assets/       # Assets enviados pelo usuário
├── build-vercel.js        # Script de build customizado
├── vercel.json           # Configuração Vercel
├── tsconfig.vercel.json  # Config TypeScript para serverless
├── vite.config.ts        # Configuração Vite
└── package.json          # Dependências
```

## 🎯 Funcionalidades por Diretório

### `/client` - Frontend React
- Sistema de pedidos online
- Painel administrativo
- Gestão de reservas
- Upload de imagens
- Autenticação JWT

### `/server` - Backend Express (dev)
- API REST para desenvolvimento
- Middleware de autenticação
- Conexão com banco de dados
- Sistema de armazenamento

### `/api` - Serverless Functions
- 6 funções otimizadas para Vercel
- Compatíveis com TypeScript
- Timeouts configurados
- Imports com extensões .js

### `/shared` - Tipos Compartilhados
- Schema Prisma
- Tipos TypeScript
- Validações Zod

### `/public` - Assets Estáticos
- Uploads de imagens
- Favicon
- Assets públicos

## 🔧 Configurações

### Build Process
- `build-vercel.js`: Script otimizado para Vercel
- `tsconfig.vercel.json`: Config TypeScript serverless
- `vercel.json`: Configuração de deployment

### Database
- Prisma ORM
- Supabase PostgreSQL
- Connection pooling

### Authentication
- JWT tokens
- Dual system (session/JWT)
- Admin credentials

## 📊 Status
- ✅ Estrutura organizada
- ✅ Build configurado
- ✅ APIs funcionais
- ✅ Database conectado
- ✅ Pronto para deploy