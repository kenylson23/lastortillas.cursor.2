# Las Tortillas Mexican Grill

Uma plataforma digital moderna para o restaurante Las Tortillas Mexican Grill com arquitetura full-stack otimizada para deploy no Vercel.

## Estrutura do Projeto

```
├── api/                    # Serverless Functions (Vercel)
│   ├── health.ts          # Health check endpoint
│   ├── menu-items.ts      # Menu management API
│   ├── orders.ts          # Order management API
│   ├── reservations.ts    # Reservation system API
│   └── tables.ts          # Table management API
├── client/                # Frontend React Application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities and configurations
│   │   ├── pages/         # Application pages
│   │   └── styles/        # CSS and styling
│   └── index.html
├── lib/                   # Shared utilities
│   └── db.ts             # Database connection
├── public/               # Static assets
├── server/               # Development server (Express + Vite)
├── shared/               # Shared schemas and types
│   └── schema.ts
├── package.json
├── vercel.json          # Vercel configuration
└── vite.config.ts       # Vite configuration
```

## Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Vercel Serverless Functions
- **Database**: PostgreSQL com Drizzle ORM
- **Deployment**: Vercel
- **UI Components**: Radix UI, shadcn/ui

## Deploy no Vercel

1. **Conectar o repositório ao Vercel**
2. **Configurar variáveis de ambiente**:
   ```
   DATABASE_URL=sua_string_de_conexao_postgresql
   ```
3. **Deploy automático** será feito pelo Vercel

### Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run check` - Verificação de tipos TypeScript
- `npm run db:push` - Aplicar migrações do banco

## APIs Disponíveis

- `GET /api/health` - Health check
- `GET /api/menu-items` - Listar itens do menu
- `POST /api/menu-items` - Criar novo item
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Criar novo pedido
- `GET /api/reservations` - Listar reservas
- `POST /api/reservations` - Criar nova reserva
- `GET /api/tables` - Listar mesas
- `POST /api/tables` - Criar nova mesa

## Funcionalidades

- Sistema de menu interativo com filtragem
- Gestão de pedidos em tempo real
- Sistema de reservas
- Painel administrativo
- Suporte a múltiplas localizações
- Design responsivo e otimizado
- Performance otimizada para SEO