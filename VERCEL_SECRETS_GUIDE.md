# Guia de Configuração de Segredos no Vercel

## 🔐 Problema: DATABASE_URL não declarado

O Vercel não consegue fazer deploy porque a `DATABASE_URL` não está configurada como variável de ambiente secreta.

## 🚀 Solução Rápida

### Opção 1: Via Dashboard do Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Vá para seu projeto
3. Clique em **Settings** → **Environment Variables**
4. Adicione nova variável:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://user:password@host:port/database`
   - **Environment**: `Production` (e `Preview` se necessário)
5. Clique em **Save**

### Opção 2: Via CLI

```bash
# Login no Vercel
vercel login

# Configurar DATABASE_URL
vercel env add DATABASE_URL production
# Cole sua URL: postgresql://user:password@host:port/database

# Configurar NODE_ENV
vercel env add NODE_ENV production
# Digite: production
```

### Opção 3: Script Automático

```bash
# Executar script que configura tudo
./scripts/setup-vercel-secrets.sh
```

## 🗄️ Como Obter DATABASE_URL

### Se usando Neon Database (Recomendado)

1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a Connection String
5. Use no Vercel

### Se usando outro PostgreSQL

```bash
# Formato da URL
postgresql://username:password@host:port/database_name

# Exemplo com SSL (obrigatório para produção)
postgresql://user:pass@host:5432/db?sslmode=require
```

## 📋 Verificação Pós-Configuração

```bash
# Verificar se variáveis foram configuradas
vercel env ls

# Fazer deploy
vercel --prod

# Testar APIs
curl https://seu-app.vercel.app/api/menu-items
```

## 🐛 Problemas Comuns

### Erro: "DATABASE_URL is not defined"
- Verificar se a variável foi salva corretamente
- Aguardar alguns minutos para propagação
- Refazer deploy: `vercel --prod`

### Erro: "Connection failed"
- Verificar se a URL está correta
- Verificar se o banco está acessível externamente
- Verificar SSL (adicionar `?sslmode=require` se necessário)

### Erro: "Invalid connection string"
- Verificar formato: `postgresql://user:pass@host:port/db`
- Verificar caracteres especiais (codificar se necessário)
- Testar conexão localmente primeiro

## 🎯 Checklist Final

- [ ] DATABASE_URL configurado no Vercel
- [ ] NODE_ENV configurado como "production"
- [ ] Deploy realizado com sucesso
- [ ] APIs respondendo corretamente
- [ ] Schema aplicado no banco (se necessário)

## 📞 Suporte

Se ainda houver problemas:

1. Verificar logs do Vercel: `vercel logs`
2. Testar localmente: `npm run dev`
3. Verificar conexão: `node scripts/test-database.js`
4. Reaplicar schema: `npm run db:push`