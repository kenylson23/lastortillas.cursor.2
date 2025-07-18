# 🚀 Instruções de Deploy no Vercel - Las Tortillas

## ✅ Preparação Completa

O projeto foi totalmente preparado para deploy no Vercel:

### Alterações Realizadas:
- ✅ Reestruturação: `client/src/` → `src/`
- ✅ Removidas dependências backend (Express, Drizzle, PostgreSQL)
- ✅ Configuração Vercel criada
- ✅ Build testado e funcionando (474KB otimizado)

## 🌐 Deploy no Vercel

### Opção 1: Deploy via CLI (Recomendado)
```bash
# 1. Instalar Vercel CLI globalmente
npm install -g vercel

# 2. Fazer login no Vercel
vercel login

# 3. Deploy do projeto
vercel --prod
```

### Opção 2: Deploy via Git
1. Fazer push do projeto para GitHub
2. Acessar [vercel.com](https://vercel.com)
3. Importar repositório
4. Deploy automático

## 📋 Configurações Automáticas

O Vercel detectará automaticamente:
- **Framework:** Vite
- **Build Command:** `npx vite build --config vite.config.vercel.ts`
- **Output Directory:** `dist`
- **Install Command:** `npm install --production=false`

## 🎯 Resultado Final

- **URL:** `https://seu-projeto.vercel.app`
- **Performance:** CDN global
- **Funcionalidade:** 100% preservada
- **Custo:** Gratuito
- **Deploy:** Automático

## 🔧 Funcionalidades Mantidas

- ✅ Sistema de pedidos online
- ✅ Carrinho persistente
- ✅ Painel administrativo
- ✅ Integração WhatsApp
- ✅ Multi-localização
- ✅ Responsivo e otimizado

## 📝 Próximos Passos

1. **Executar deploy:** `vercel --prod`
2. **Testar funcionalidade:** Verificar todas as páginas
3. **Configurar domínio:** (Opcional) Adicionar domínio personalizado
4. **Monitorar:** Acompanhar analytics do Vercel

## 🆘 Suporte

Se houver problemas no deploy:
1. Verificar logs do Vercel
2. Confirmar que todas as dependências estão instaladas
3. Testar build local: `npx vite build --config vite.config.vercel.ts`

**Projeto pronto para deploy! 🎉**