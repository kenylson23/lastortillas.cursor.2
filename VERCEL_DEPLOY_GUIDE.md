# Guia de Deploy Vercel - Las Tortillas

## 🎯 Problema Resolvido
Consolidação de múltiplos arquivos de configuração conflitantes que estavam causando falhas no build do Vercel.

## 🔧 Solução Implementada

### 1. Configurações Removidas
❌ **Arquivos removidos:**
- `vite.config.simple.ts` (duplicado)
- `vite.config.vercel.ts` (duplicado)
- `temp_tsconfig.json` (conflitante)
- `tsconfig.production.json` (desnecessário)
- `build-frontend-only.js` (complexo demais)
- `build-simple.js` (redundante)
- `build-vercel.ts` (tinha dependências problemáticas)
- `build.sh` (bash script desnecessário)
- `dist-production/` (pasta de build antiga)

### 2. Configurações Consolidadas

#### ✅ `build.js` (Novo script unificado)
```javascript
#!/usr/bin/env node
- Build limpo e simples
- Configuração de ambiente para Vercel
- Desabilitação automática de plugins Replit
- Tratamento de erros robusto
- Criação de 404.html para SPA
- Copia assets estáticos
```

#### ✅ `tsconfig.json` (Simplificado)
```json
- Configuração única para todo o projeto
- Paths corrigidos para @assets
- Inclui build.js
- Exclui dist-production
```

#### ✅ `vercel.json` (Atualizado)
```json
- buildCommand: "node build.js"
- Configuração de serverless functions mantida
- Rewrites para SPA mantidos
```

#### ✅ `.vercelignore` (Novo)
```
- Exclui arquivos de desenvolvimento
- Remove configurações desnecessárias
- Otimiza tamanho do deployment
```

## 🚀 Como Usar

### Deploy no Vercel
1. Conecte o repositório no Vercel
2. O build será executado automaticamente com `node build.js`
3. Arquivos serão servidos de `dist/`

### Desenvolvimento Local
```bash
npm run dev  # Servidor de desenvolvimento (Replit)
node build.js  # Teste do build para produção
```

## 📊 Benefícios da Solução

1. **Simplicidade**: Um único script de build
2. **Compatibilidade**: Funciona tanto no Replit quanto no Vercel
3. **Manutenibilidade**: Configuração centralizada
4. **Performance**: Build otimizado e rápido
5. **Confiabilidade**: Tratamento de erros robusto

## ✅ Verificação de Funcionamento

- ✅ Build funciona localmente
- ✅ Arquivos são gerados em `dist/`
- ✅ 404.html criado para SPA
- ✅ Assets estáticos copiados
- ✅ Uploads directory criado
- ✅ Tamanho do build: 3.4MB

## 🔄 Próximos Passos

1. Fazer deploy no Vercel com as novas configurações
2. Testar todas as funcionalidades em produção
3. Verificar se as serverless functions estão funcionando
4. Confirmar que o banco de dados está conectado

## 🐛 Troubleshooting

### Se o build falhar:
1. Verificar se node_modules está instalado
2. Rodar `node build.js` localmente primeiro
3. Verificar logs do Vercel para erros específicos

### Se APIs não funcionarem:
1. Verificar se arquivos api/*.ts estão presentes
2. Confirmar configuração de environment variables
3. Testar endpoints individualmente