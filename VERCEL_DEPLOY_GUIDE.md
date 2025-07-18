# Guia de Deploy para Vercel - Las Tortillas Mexican Grill

## 📋 Status do Projeto

✅ **Completamente adaptado ao ambiente Vercel**

### ✅ Configurações Implementadas

- **Frontend**: React SPA com Vite
- **Backend**: Serverless Functions (/api)
- **Database**: PostgreSQL com Drizzle ORM
- **Runtime**: Node.js 20.x
- **Build**: Script otimizado (build-vercel.mjs)

## 🚀 Como Fazer Deploy

### 1. Preparar o Projeto

```bash
# Verificar se tudo está funcionando localmente
npm run dev

# Executar build para testar
node build-vercel.mjs
```

### 2. Configurar Vercel CLI

```bash
# Instalar Vercel CLI (se necessário)
npm i -g vercel

# Login no Vercel
vercel login

# Inicializar projeto
vercel
```

### 3. Configurar Variáveis de Ambiente

No dashboard do Vercel ou via CLI:

```bash
# Configurar DATABASE_URL
vercel env add DATABASE_URL
# Cole a URL do seu banco PostgreSQL

# Outras variáveis (se necessário)
vercel env add NODE_ENV production
```

### 4. Deploy

```bash
# Deploy de desenvolvimento
vercel

# Deploy de produção
vercel --prod
```

## 🗂️ Estrutura para Vercel

```
├── api/                    # Serverless Functions
│   ├── menu-items.ts      # CRUD menu items
│   ├── orders.ts          # CRUD orders
│   ├── reservations.ts    # CRUD reservations
│   └── tables.ts          # CRUD tables
├── lib/                   # Utilities
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
├── src/                  # Frontend (React)
├── dist/                 # Build output
├── vercel.json          # Configuração Vercel
└── build-vercel.mjs     # Build script
```

## ⚙️ Configurações do vercel.json

```json
{
  "framework": "vite",
  "buildCommand": "node build-vercel.mjs",
  "outputDirectory": "dist",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🔌 APIs Disponíveis

### Menu Items
- `GET /api/menu-items` - Listar itens do menu
- `POST /api/menu-items` - Criar item
- `PUT /api/menu-items` - Atualizar item
- `DELETE /api/menu-items` - Remover item

### Orders
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Criar pedido
- `PUT /api/orders` - Atualizar pedido
- `DELETE /api/orders` - Remover pedido

### Reservations
- `GET /api/reservations` - Listar reservas
- `POST /api/reservations` - Criar reserva

### Tables
- `GET /api/tables` - Listar mesas
- `POST /api/tables` - Criar mesa
- `PUT /api/tables` - Atualizar mesa
- `DELETE /api/tables` - Remover mesa

## 🗄️ Database Setup

Após o primeiro deploy, executar:

```bash
# Push do schema para o banco
npm run db:push

# Verificar se as tabelas foram criadas
# (dados de exemplo serão inseridos automaticamente)
```

## 🔍 Verificações Pós-Deploy

1. **Frontend**: Verificar se a página principal carrega
2. **APIs**: Testar endpoints em `https://seu-app.vercel.app/api/menu-items`
3. **Database**: Verificar se dados são inseridos/recuperados
4. **Images**: Verificar se imagens são servidas corretamente

## 🐛 Troubleshooting

### Erro de Database Connection
- Verificar se DATABASE_URL está configurado
- Confirmar que o banco PostgreSQL está acessível

### Erro 404 nas APIs
- Verificar se arquivos estão em `/api/`
- Confirmar configuração do vercel.json

### Erro de Build
- Executar `node build-vercel.mjs` localmente
- Verificar logs do build no dashboard Vercel

## 📞 Suporte

O projeto está **100% configurado para Vercel** com:

✅ Serverless Functions funcionais
✅ Database PostgreSQL integrado
✅ Frontend React otimizado
✅ Build script automatizado
✅ Configurações de produção

**Status**: Pronto para deploy! 🚀