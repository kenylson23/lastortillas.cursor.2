# Las Tortillas Mexican Grill - Vercel Deploy

## Configuração para Deploy no Vercel

### 1. Estrutura do Projeto
```
├── src/                    # Frontend React
├── public/                 # Assets estáticos
├── attached_assets/        # Imagens e mídia
├── dist/                   # Build output (gerado automaticamente)
├── vercel.json             # Configuração do Vercel
├── vite.config.vercel.ts   # Configuração Vite para Vercel
└── package.json            # Dependências
```

### 2. Arquivos de Configuração

#### vercel.json
- Configuração de build e deploy
- Rewrites para SPA routing
- Headers para cache otimizado

#### vite.config.vercel.ts
- Configuração Vite específica para Vercel
- Aliases de paths ajustados
- Output directory configurado

### 3. Comandos de Build

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npx vite build --config vite.config.vercel.ts

# Preview do build
npx vite preview
```

### 4. Deploy no Vercel

1. **Via CLI:**
```bash
npm i -g vercel
vercel --prod
```

2. **Via Git:**
- Conectar repositório ao Vercel
- Deploy automático a cada push

### 5. Funcionalidades

- ✅ SPA estático com React
- ✅ Roteamento client-side
- ✅ Dados estáticos em localStorage
- ✅ Integração WhatsApp para pedidos
- ✅ Sistema de carrinho persistente
- ✅ Interface administrativa
- ✅ Otimização de performance

### 6. Observações

- Não há backend - aplicação 100% frontend
- Dados persistem apenas no navegador
- Pedidos são processados via WhatsApp
- Deploy gratuito no Vercel
- CDN global para performance

### 7. Configurações Importantes

- **Framework:** Vite
- **Output:** dist/
- **SPA Routing:** Configurado
- **Cache:** Otimizado para assets
- **Performance:** Lazy loading implementado