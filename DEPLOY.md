# Guia de Deploy - Las Tortillas Mexican Grill

## Preparação Completa para Vercel

### ✅ Alterações Realizadas

1. **Reestruturação do Projeto**
   - Movido `client/src/` para `src/`
   - Movido `client/index.html` para raiz
   - Configurado aliases de paths

2. **Limpeza de Dependências**
   - Removido Express e dependências de servidor
   - Removido Drizzle ORM e PostgreSQL
   - Removido multer, session, passport
   - Mantido apenas dependências do frontend

3. **Configuração Vercel**
   - Criado `vercel.json` com configuração SPA
   - Criado `vite.config.vercel.ts` personalizado
   - Configurado `.vercelignore`

4. **Funcionalidade Estática**
   - Dados estáticos em `src/lib/constants.ts`
   - localStorage para persistência
   - WhatsApp integration para pedidos

### 🚀 Como Fazer o Deploy

#### Opção 1: Deploy via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

#### Opção 2: Deploy via Git
1. Fazer push do código para GitHub
2. Conectar repositório no Vercel Dashboard
3. Deploy automático

### 📋 Checklist Pré-Deploy

- [x] Estrutura reorganizada
- [x] Dependências limpas
- [x] Configurações Vercel criadas
- [x] Build funcionando
- [x] SPA routing configurado
- [x] Assets otimizados

### 🎯 Resultado Final

- **Aplicação:** SPA React otimizada
- **Performance:** CDN global
- **Funcionalidade:** Completa sem backend
- **Custo:** Gratuito no Vercel
- **Manutenção:** Simplificada

### 📝 Notas Importantes

- Todos os dados são estáticos
- Carrinho persiste no navegador
- Pedidos via WhatsApp
- Admin funciona com localStorage
- Performance otimizada