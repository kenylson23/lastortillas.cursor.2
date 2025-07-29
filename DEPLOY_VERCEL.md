# 🚀 Guia de Deploy no Vercel - Las Tortillas Mx

## 📋 **Análise do Projeto**

### ✅ **Estrutura Atual:**
- **Frontend**: React + Vite + TypeScript
- **Backend**: Express + Node.js
- **Database**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + shadcn/ui

### ⚠️ **Desafios Identificados:**
1. **Arquitetura híbrida** (frontend + backend no mesmo repo)
2. **Dependências específicas do Replit**
3. **Servidor Express integrado**
4. **WebSocket não suportado no Vercel**

## 🎯 **Solução Implementada:**

### **1. Separação Frontend/Backend**
```
├── client/           # Frontend (Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── api/              # Backend (Vercel Functions)
│   ├── availability.ts
│   ├── reservations.ts
│   ├── orders.ts
│   └── menu.ts
└── shared/           # Código compartilhado
```

### **2. Configuração Vercel**
- **vercel.json**: Roteamento e builds
- **API Functions**: Serverless functions
- **Static Build**: Frontend otimizado

## 🚀 **Passos para Deploy:**

### **1. Preparação Local**
```bash
# Instalar dependências do frontend
cd client
npm install

# Testar build local
npm run build
```

### **2. Configurar Variáveis de Ambiente**
No Vercel Dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

### **3. Deploy no Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel --prod
```

## 📁 **Estrutura de Arquivos:**

### **Frontend (client/)**
- ✅ Vite config limpo (sem plugins Replit)
- ✅ Build otimizado para produção
- ✅ Proxy para desenvolvimento local

### **Backend (api/)**
- ✅ Serverless functions
- ✅ Integração com Supabase
- ✅ Cache otimizado

### **Configuração (vercel.json)**
- ✅ Roteamento automático
- ✅ Builds separados
- ✅ Timeout configurado

## 🔧 **Comandos Úteis:**

### **Desenvolvimento Local:**
```bash
# Frontend
cd client && npm run dev

# Backend (local)
npm run dev

# Build completo
npm run build
```

### **Deploy:**
```bash
# Deploy automático
vercel

# Deploy produção
vercel --prod

# Ver logs
vercel logs
```

## ⚡ **Otimizações Implementadas:**

### **Performance:**
- ✅ Code splitting automático
- ✅ Cache headers otimizados
- ✅ Lazy loading de imagens
- ✅ Bundle size otimizado

### **SEO:**
- ✅ Meta tags dinâmicas
- ✅ Sitemap automático
- ✅ Open Graph tags

### **Segurança:**
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Input validation

## 🎯 **Próximos Passos:**

1. **Testar deploy** em ambiente de desenvolvimento
2. **Configurar domínio** personalizado
3. **Monitorar performance** com Vercel Analytics
4. **Implementar CI/CD** com GitHub Actions

## 📞 **Suporte:**

- **Documentação Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Issues**: Criar issue no GitHub

---

**Status**: ✅ Pronto para deploy
**Complexidade**: Médio
**Tempo estimado**: 30 minutos