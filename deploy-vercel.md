# 🚀 Deploy no Vercel - Guia Alternativo

## 📋 **Método 1: Deploy via GitHub (Recomendado)**

### **1. Preparar o Repositório**
```bash
# Fazer commit das mudanças
git add .
git commit -m "Preparar para deploy no Vercel"
git push origin main
```

### **2. Conectar ao Vercel**
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe o repositório `LasTortilhasMx-2`

### **3. Configurar Build Settings**
- **Framework Preset**: Vite
- **Root Directory**: `./client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### **4. Configurar Variáveis de Ambiente**
No Vercel Dashboard → Settings → Environment Variables:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres.[project-id]:[sua-senha]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
NODE_ENV=production
```

### **5. Deploy Automático**
- O Vercel fará deploy automático
- Cada push para `main` atualiza o site

## 📋 **Método 2: Deploy Manual**

### **1. Instalar Vercel CLI (se possível)**
```bash
npm install -g vercel
```

### **2. Login e Deploy**
```bash
vercel login
vercel --prod
```

## 🎯 **Estrutura Final**

```
├── client/              # Frontend (deployado)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── api/                 # Backend (serverless)
│   ├── availability.ts
│   ├── reservations.ts
│   ├── orders.ts
│   ├── menu.ts
│   ├── auth.ts
│   └── contact.ts
├── shared/              # Código compartilhado
├── vercel.json          # Configuração
└── package.json         # Dependências
```

## ⚡ **URLs de Deploy**

- **Frontend**: `https://lastortilhas-mx.vercel.app`
- **API**: `https://lastortilhas-mx.vercel.app/api/*`
- **Admin**: `https://lastortilhas-mx.vercel.app/admin`
- **Cozinha**: `https://lastortilhas-mx.vercel.app/kitchen`

## 🔧 **Comandos Úteis**

### **Desenvolvimento Local**
```bash
# Frontend
cd client && npm run dev

# Backend (local)
npm run dev
```

### **Build Local**
```bash
cd client && npm run build
```

## 📞 **Suporte**

- **Vercel Docs**: https://vercel.com/docs
- **Status**: https://vercel.com/status
- **Community**: https://github.com/vercel/vercel/discussions

---

**Status**: ✅ Configurado para deploy
**Próximo**: Conectar repositório no Vercel