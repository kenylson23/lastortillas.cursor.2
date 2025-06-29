# Las Tortilhas Restaurant Website

Uma landing page moderna para o restaurante mexicano Las Tortilhas, localizado na Ilha de Luanda, Angola.

## 🚀 Deploy no Vercel

Este projeto está otimizado para deploy no Vercel como uma aplicação estática (SPA).

### Configurações Importantes:

1. **Framework Preset**: Vite
2. **Build Command**: `vite build`
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

### Passos para Deploy:

1. Conecte seu repositório ao Vercel
2. As configurações serão detectadas automaticamente através do `vercel.json`
3. O site será deployado como uma Single Page Application

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animações**: Framer Motion
- **Roteamento**: Wouter
- **Formulários**: React Hook Form + Zod

## 📱 Funcionalidades

- Design responsivo com tema das cores da bandeira mexicana
- Animações 3D e efeitos de scroll
- Navegação suave entre seções
- Formulário de reserva integrado com WhatsApp
- Menu interativo com cards animados
- Informações de localização e contato

## 🎨 Design

O site utiliza as cores da bandeira mexicana como tema principal:
- Verde: `hsl(156, 100%, 19.6%)`
- Vermelho: `hsl(348, 88.2%, 47.1%)`
- Laranja: `hsl(25, 95%, 53%)`

## 📞 Contato

- **WhatsApp**: +244 949 639 932
- **Email**: info@lastortilhas.ao
- **Endereço**: Ilha de Luanda, Angola

## 🏗️ Estrutura do Projeto

```
├── client/src/
│   ├── components/     # Componentes React
│   ├── pages/         # Páginas da aplicação
│   ├── lib/           # Utilitários e constantes
│   └── hooks/         # Custom hooks
├── vercel.json        # Configuração do Vercel
└── README.md         # Este arquivo
```