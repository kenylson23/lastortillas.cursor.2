# Las Tortillas Mexican Grill - Next.js Vercel Deployment Guide

## 📋 Preparação para Deploy na Vercel

Este guia explica como preparar e fazer deploy do projeto Las Tortillas Mexican Grill na Vercel usando Next.js.

## 🚀 Pré-requisitos

1. **Conta na Vercel**: [https://vercel.com](https://vercel.com)
2. **Repositório Git**: GitHub, GitLab ou Bitbucket
3. **Database PostgreSQL**: Neon, Supabase ou outro provider
4. **Node.js**: Versão 18+ instalada localmente

## 📁 Estrutura do Projeto Next.js

```
las-tortillas-nextjs/
├── pages/
│   ├── api/
│   │   ├── health.ts
│   │   ├── menu-items.ts
│   │   └── orders.ts
│   ├── _app.tsx
│   └── index.tsx
├── lib/
│   ├── db-nextjs.ts
│   └── schema.ts
├── styles/
│   └── globals.css
├── package-nextjs-optimized.json
├── next.config.optimized.js
├── tailwind.config.nextjs.js
├── drizzle.config.nextjs.ts
├── vercel-optimized.json
└── .env.local.template
```

## 🔧 Configuração Inicial

### 1. Configurar Arquivos de Configuração

Substitua ou renomeie os arquivos existentes:

```bash
# Renomear package.json para Next.js
mv package-nextjs-optimized.json package.json

# Renomear configurações do Next.js
mv next.config.optimized.js next.config.js
mv tailwind.config.nextjs.js tailwind.config.js
mv postcss.config.nextjs.js postcss.config.js
mv tsconfig.nextjs.json tsconfig.json
mv drizzle.config.nextjs.ts drizzle.config.ts
mv vercel-optimized.json vercel.json
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie `.env.local.template` para `.env.local`:

```bash
cp .env.local.template .env.local
```

Edite `.env.local` com suas configurações:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Las Tortillas
NEXT_PUBLIC_WHATSAPP_NUMBER="+244949639932"
NEXT_PUBLIC_RESTAURANT_NAME="Las Tortillas Mexican Grill"
```

## 🗄️ Configuração do Banco de Dados

### 1. Aplicar Migrações

```bash
npm run db:push
```

### 2. Verificar Conexão

```bash
npm run dev
# Acessar: http://localhost:3000/api/health
```

## 📤 Deploy na Vercel

### Método 1: Via Dashboard da Vercel

1. **Conectar Repositório**:
   - Acesse [Vercel Dashboard](https://vercel.com/dashboard)
   - Clique em "New Project"
   - Conecte seu repositório Git

2. **Configurar Build**:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Configurar Variáveis de Ambiente**:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-secret-key
   NEXT_PUBLIC_WHATSAPP_NUMBER=+244949639932
   ```

4. **Deploy**:
   - Clique em "Deploy"
   - Aguarde o build completar

### Método 2: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

## 🔍 Verificação Pós-Deploy

### 1. Testar Endpoints da API

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Menu items
curl https://your-app.vercel.app/api/menu-items

# Orders
curl https://your-app.vercel.app/api/orders
```

### 2. Verificar Homepage

Acesse: `https://your-app.vercel.app`

- ✅ Página carrega corretamente
- ✅ Menu items são exibidos
- ✅ Botões funcionam
- ✅ Links do WhatsApp funcionam

## 🛠️ Otimizações Implementadas

### Performance
- **Image Optimization**: WebP e AVIF automático
- **Bundle Analysis**: Webpack otimizado
- **CSS Optimization**: TailwindCSS com purging
- **Static Generation**: ISR para páginas dinâmicas

### SEO
- **Meta Tags**: Open Graph e Twitter Cards
- **Structured Data**: JSON-LD para restaurante
- **XML Sitemap**: Geração automática
- **Robots.txt**: Configurado para indexação

### Security
- **Headers**: Security headers configurados
- **Environment**: Variáveis de ambiente seguras
- **Validation**: Zod schemas para APIs
- **Rate Limiting**: Implementado nas APIs

## 🔄 Atualizações Contínuas

### 1. Database Migrations

```bash
# Gerar nova migração
npm run db:generate

# Aplicar migrações
npm run db:push
```

### 2. Deploy Automático

- **Git Integration**: Push para main = deploy automático
- **Preview Deployments**: Branches = preview links
- **Rollback**: Rollback com um clique

## 🐛 Troubleshooting

### Build Errors

```bash
# Verificar tipos TypeScript
npm run type-check

# Verificar ESLint
npm run lint

# Build local
npm run build
```

### Database Connection

```bash
# Testar conexão local
node -e "console.log(process.env.DATABASE_URL)"

# Verificar migrations
npm run db:push
```

### Environment Variables

1. Verificar se todas as variáveis estão definidas
2. Confirmar sintaxe do DATABASE_URL
3. Testar localmente primeiro

## 📊 Monitoramento

### 1. Vercel Analytics

- **Performance**: Core Web Vitals
- **Traffic**: Visitors e page views
- **Errors**: Runtime errors

### 2. Database Monitoring

- **Connection Pool**: Monitorar connections
- **Query Performance**: Slow queries
- **Storage**: Uso do banco

## 🎯 Próximos Passos

1. **Domain Custom**: Configurar domínio próprio
2. **CDN**: Otimizar assets estáticos
3. **Monitoring**: Configurar alertas
4. **Backup**: Estratégia de backup do banco
5. **CI/CD**: Pipeline de testes automatizados

## 📞 Suporte

- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Drizzle ORM**: [https://orm.drizzle.team](https://orm.drizzle.team)

---

✅ **Projeto pronto para deploy na Vercel!**

O projeto Las Tortillas está otimizado e configurado para deploy profissional na Vercel com todas as melhores práticas implementadas.