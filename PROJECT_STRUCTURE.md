# Estrutura do Projeto - Las Tortillas Mexican Grill

Este documento descreve a organização de pastas e arquivos do projeto seguindo as melhores práticas do Next.js e desenvolvimento full-stack.

## Estrutura de Diretórios

```
📁 Las Tortillas Mexican Grill/
├── 📁 public/                    # Arquivos estáticos (imagens, ícones, fontes)
│   ├── 📁 images/               # Imagens do site (hero, restaurante, etc.)
│   ├── 📁 uploads/              # Uploads de usuários (imagens do menu, etc.)
│   └── favicon.ico              # Ícone do site
│
├── 📁 src/                      # Todo o código-fonte da aplicação
│   ├── 📁 components/           # Componentes React reutilizáveis
│   │   ├── 📁 ui/              # Componentes de interface (shadcn/ui)
│   │   ├── About.tsx           # Seção sobre o restaurante
│   │   ├── Contact.tsx         # Formulário de contato
│   │   ├── Features.tsx        # Características do restaurante
│   │   ├── Footer.tsx          # Rodapé do site
│   │   ├── Hero.tsx            # Seção principal (banner)
│   │   ├── MenuShowcase.tsx    # Exibição do menu
│   │   ├── Navigation.tsx      # Menu de navegação
│   │   └── ...                 # Outros componentes
│   │
│   ├── 📁 pages/               # Páginas da aplicação + API Routes
│   │   ├── 📁 api/             # API Routes serverless do backend
│   │   │   ├── health.ts       # Endpoint de saúde da API
│   │   │   ├── menu-items.ts   # CRUD de itens do menu
│   │   │   ├── orders.ts       # Gerenciamento de pedidos
│   │   │   ├── reservations.ts # Sistema de reservas
│   │   │   └── tables.ts       # Gerenciamento de mesas
│   │   │
│   │   ├── Admin.tsx           # Página de administração
│   │   ├── Home.tsx            # Página inicial
│   │   ├── Login.tsx           # Página de login
│   │   ├── Menu.tsx            # Página do menu
│   │   └── OrderTracking.tsx   # Rastreamento de pedidos
│   │
│   ├── 📁 styles/              # Arquivos CSS e configuração do Tailwind
│   │   ├── index.css           # Estilos globais e configuração Tailwind
│   │   └── performance.css     # Estilos otimizados para performance
│   │
│   ├── 📁 utils/               # Funções utilitárias e helpers
│   │   ├── image-cache.ts      # Sistema de cache para imagens
│   │   └── performance.ts      # Utilitários de otimização
│   │
│   ├── 📁 hooks/               # Custom hooks React
│   │   ├── use-toast.ts        # Hook para notificações
│   │   ├── use-lazy-load.ts    # Hook para lazy loading
│   │   ├── use-performance.ts  # Hook de otimização
│   │   └── useAuth.ts          # Hook de autenticação
│   │
│   └── 📁 lib/                 # Bibliotecas e configurações
│       ├── constants.ts        # Constantes da aplicação
│       ├── queryClient.ts      # Configuração TanStack Query
│       └── utils.ts            # Utilitários gerais
│
├── 📁 data/                     # Dados de mock e inicialização
│   ├── menu-items.json         # Dados do menu para desenvolvimento
│   ├── restaurant-locations.json # Informações das localizações
│   └── user-roles.json         # Perfis e permissões de usuários
│
├── 📁 server/                   # Backend Express.js (desenvolvimento)
│   ├── db.ts                   # Configuração do banco de dados
│   ├── index.ts                # Servidor principal
│   ├── routes.ts               # Rotas da API
│   └── storage.ts              # Interface de armazenamento
│
├── 📁 shared/                   # Tipos e schemas compartilhados
│   └── schema.ts               # Esquemas Drizzle e tipos TypeScript
│
└── 📁 api/                     # API Routes para Vercel (serverless)
    ├── health.ts               # Endpoint de saúde
    ├── menu-items.ts           # CRUD de menu
    ├── orders.ts               # Gerenciamento de pedidos
    ├── reservations.ts         # Sistema de reservas
    └── tables.ts               # Gerenciamento de mesas
```

## Descrição das Pastas

### 🟢 **public/**
Contém todos os arquivos estáticos que serão servidos diretamente pelo servidor:
- **images/**: Imagens do site (hero, logo, fotos do restaurante)
- **uploads/**: Imagens enviadas pelos usuários (fotos do menu)
- Ícones, fontes e outros assets estáticos

### 🔵 **src/components/**
Componentes React reutilizáveis organizados por funcionalidade:
- **ui/**: Componentes de interface básicos (botões, modais, formulários)
- Componentes específicos do negócio (Menu, Reservas, Contato, etc.)

### 🟣 **src/pages/**
Páginas da aplicação e API Routes seguindo padrão Next.js:
- **api/**: Endpoints serverless do backend
- Páginas React para navegação do usuário

### 🟡 **src/styles/**
Arquivos de estilo e configuração:
- CSS global com Tailwind CSS
- Estilos de performance otimizados

### 🟠 **src/utils/**
Funções auxiliares e utilitários:
- Cache de imagens
- Otimizações de performance
- Helpers diversos

### 🔴 **src/hooks/**
Custom hooks React para lógica reutilizável:
- Autenticação
- Lazy loading
- Notificações (toast)
- Performance

### ⚪ **src/lib/**
Bibliotecas, constantes e configurações:
- Configuração do cliente de queries
- Constantes da aplicação
- Utilitários gerais

### 🟤 **data/**
Dados para desenvolvimento e testes:
- JSONs com dados do menu
- Informações das localizações
- Dados de usuários e permissões

## Vantagens desta Estrutura

1. **Organização Clara**: Separação lógica entre frontend, backend e assets
2. **Escalabilidade**: Fácil de expandir com novos componentes e páginas
3. **Reutilização**: Componentes, hooks e utils facilmente reutilizáveis
4. **Manutenção**: Código organizado facilita manutenção e debugging
5. **Performance**: Assets otimizados e lazy loading implementado
6. **Desenvolvimento**: Dados de mock para desenvolvimento rápido

## Como Usar

### Adicionar Novo Componente
```bash
src/components/MeuNovoComponente.tsx
```

### Criar Nova Página
```bash
src/pages/MinhaNovaPagina.tsx
```

### Adicionar API Route
```bash
src/pages/api/minha-nova-api.ts
```

### Adicionar Assets Estáticos
```bash
public/images/minha-nova-imagem.jpg
```

### Criar Hook Personalizado
```bash
src/hooks/use-meu-hook.ts
```

Esta estrutura segue as melhores práticas do Next.js e permite desenvolvimento eficiente e organizadodo projeto Las Tortillas Mexican Grill.