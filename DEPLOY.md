# Deploy do Las Tortillas Mexican Grill no Vercel

## Configuração Limpa e Otimizada

Este projeto está configurado para deploy automático no Vercel com uma configuração limpa e eficiente.

### Arquivos de Configuração

#### vercel.json
- **buildCommand**: `node build-vercel.js` - Script otimizado que:
  - Limpa builds anteriores
  - Executa `vite build`
  - Move arquivos da estrutura `/dist/public` para `/dist`
  - Copia assets públicos
  - Valida o build final
  
- **outputDirectory**: `dist` - Diretório final com todos os arquivos estáticos
- **Framework**: Vite (detecção automática)
- **Cache Headers**: Otimizados para performance

#### .vercelignore
Exclui do deploy:
- `server/` - Backend não é necessário para deploy estático
- `node_modules` - Gerenciado pelo Vercel
- Arquivos de desenvolvimento
- Cache e logs

### Estrutura Final do Deploy

```
dist/
├── index.html          # Página principal
├── assets/            # JS, CSS e assets otimizados
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [imagens].jpg
├── images/            # Imagens estáticas
└── uploads/           # Uploads de usuário
```

### Comando para Deploy Local

```bash
# Testar build localmente
node build-vercel.js

# Verificar output
ls -la dist/
```

### Características do Build

1. **Otimização Automática**: Vite otimiza automaticamente:
   - Minificação de JS/CSS
   - Code splitting
   - Tree shaking
   - Compressão de imagens

2. **Cache Inteligente**: Headers configurados para:
   - Assets com hash: cache permanente
   - index.html: sempre revalida

3. **Zero Configuração**: O Vercel detecta automaticamente:
   - Framework Vite
   - Dependências do Node.js
   - Configurações de build

### Para Deploy no Vercel

1. Conecte o repositório ao Vercel
2. O Vercel detectará automaticamente as configurações
3. Deploy automático em cada push

**Resultado**: Site estático otimizado, rápido e sem complexidade desnecessária.