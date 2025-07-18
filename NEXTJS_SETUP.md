# Configuração Next.js - Las Tortillas Mexican Grill

Este documento descreve a configuração completa do Next.js implementada no projeto.

## Arquivos de Configuração Criados

### 📦 `package-nextjs.json`
- **Dependências principais**: React 18, Next.js 14, Supabase
- **Dependências de desenvolvimento**: TypeScript, TailwindCSS, ESLint
- **Scripts**: dev, build, start, lint

### ⚙️ `next.config.js`
- Configuração de imagens otimizada
- Suporte a domínios externos para imagens
- Estrutura preparada para redirects e rewrites

### 🎨 `tailwind.config.js`
- Configuração personalizada com cores da marca Las Tortillas
- Cores inspiradas na bandeira mexicana (verde, vermelho, creme)
- Animações customizadas (fade-in, slide-up, bounce-gentle)
- Fontes personalizadas (Inter, Poppins)

### 🔧 `postcss.config.js`
- Configuração básica com TailwindCSS e Autoprefixer
- Otimização automática de CSS

### 🔒 `.env.local`
- Variáveis de ambiente com placeholders
- Configurações do Supabase
- Configurações de banco de dados
- Configurações opcionais (Stripe, SMTP, NextAuth)

### 📝 `.gitignore`
- Configuração completa para projetos Next.js
- Exclusões específicas do Las Tortillas (uploads)
- Proteção de arquivos sensíveis

### 🔍 `.eslintrc.json`
- Configuração ESLint para Next.js
- Regras customizadas para melhor desenvolvimento

### 📘 `tsconfig.json`
- Configuração TypeScript otimizada
- Path aliases configurados (@/, @/components, etc.)
- Suporte completo ao Next.js

## Como Usar Esta Configuração

### 1. Instalar Dependências
```bash
# Renomear package-nextjs.json para package.json
mv package-nextjs.json package.json

# Instalar dependências
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar template
cp .env.local .env.local

# Editar com valores reais
# NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 3. Executar Projeto
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Verificar código
npm run lint
```

## Estrutura de Desenvolvimento

### Aliases de Path Configurados
- `@/` → `./src/`
- `@/components/` → `./src/components/`
- `@/pages/` → `./src/pages/`
- `@/styles/` → `./src/styles/`
- `@/utils/` → `./src/utils/`
- `@/hooks/` → `./src/hooks/`
- `@/lib/` → `./src/lib/`
- `@/data/` → `./data/`

### Exemplo de Import
```typescript
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { menuData } from '@/data/menu-items.json';
```

## Cores da Marca Configuradas

### Cores Principais
- **Verde Mexicano**: `#006847`
- **Vermelho Mexicano**: `#ce1126`
- **Creme**: `#f5f5dc`

### Cores de Destaque
- **Laranja**: `#ff6b35`
- **Amarelo**: `#f7931e`

### Uso no Tailwind
```jsx
<div className="bg-mexican-green text-mexican-cream">
  <h1 className="text-accent-orange">Las Tortillas</h1>
</div>
```

## Animações Personalizadas

### Animações Disponíveis
- `animate-fade-in`: Efeito fade suave
- `animate-slide-up`: Slide de baixo para cima
- `animate-bounce-gentle`: Bounce suave e contínuo

### Uso
```jsx
<div className="animate-fade-in">
  <h1 className="animate-slide-up">Bem-vindos!</h1>
</div>
```

## Próximos Passos

1. **Migrar componentes existentes** para usar nova configuração
2. **Configurar Supabase** com variáveis reais
3. **Implementar sistema de autenticação** com NextAuth
4. **Otimizar imagens** usando Next.js Image
5. **Configurar banco de dados** para produção

## Comandos Úteis

```bash
# Gerar componente
npx create-next-app --example with-tailwindcss

# Verificar build
npm run build && npm start

# Analisar bundle
npm install --save-dev @next/bundle-analyzer
```

Esta configuração fornece uma base sólida e otimizada para o desenvolvimento do projeto Las Tortillas Mexican Grill usando Next.js com as melhores práticas.