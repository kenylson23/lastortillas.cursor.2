# Las Tortillas Mexican Grill - Deploy Completo no Vercel

## 🚀 Configuração Completa Full-Stack

Este projeto agora está preparado para deploy completo no Vercel com backend através de **Serverless Functions**.

### 📋 Pré-requisitos

1. **Conta no Vercel** (grátis em vercel.com)
2. **Repositório Git** (GitHub, GitLab, ou Bitbucket)
3. **Database URL do Supabase** (sua connection string atual)

### 🛠️ Estrutura da API

Todas as funções da API estão organizadas na pasta `/api/`:

```
api/
├── health.ts              # Status da API
├── menu-items.ts          # CRUD de itens do menu
├── menu-items/[id].ts     # Operações específicas de item
├── orders.ts              # CRUD de pedidos
├── orders/[id].ts         # Buscar/deletar pedido específico
├── orders/[id]/status.ts  # Atualizar status do pedido
├── tables.ts              # CRUD de mesas
├── tables/[id]/status.ts  # Atualizar status da mesa
├── reservations.ts        # Sistema de reservas
├── contacts.ts            # Formulário de contato
└── availability.ts        # Verificar disponibilidade
```

### 🎯 Passos para Deploy

#### 1. Preparar o Código
```bash
# Execute o script de build para Vercel
node build-vercel-fullstack.js
```

#### 2. Push para Git
```bash
git add .
git commit -m "Preparado para deploy completo no Vercel"
git push origin main
```

#### 3. Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe seu repositório Git
4. Vercel detectará automaticamente a configuração

#### 4. Configurar Variáveis de Ambiente

No painel do Vercel, adicione:

```
DATABASE_URL=sua_connection_string_do_supabase
```

**⚠️ Importante**: Use sua connection string atual do Supabase que já está funcionando.

#### 5. Deploy!

Clique em "Deploy" e aguarde. O Vercel irá:

- ✅ Construir o frontend React
- ✅ Criar as funções serverless da API
- ✅ Conectar ao banco Supabase
- ✅ Disponibilizar em uma URL global

### 🌐 URLs da Aplicação

Após o deploy:

- **Frontend**: `https://seu-projeto.vercel.app`
- **API**: `https://seu-projeto.vercel.app/api/health`

### 🔧 Funcionalidades Disponíveis

#### Frontend
- ✅ Site completo do restaurante
- ✅ Sistema de pedidos online
- ✅ Painel administrativo
- ✅ Rastreamento de pedidos
- ✅ Sistema de reservas

#### Backend (API)
- ✅ Gestão completa do menu
- ✅ Sistema de pedidos em tempo real
- ✅ Controle de mesas
- ✅ Sistema de reservas
- ✅ Formulários de contato
- ✅ Verificação de disponibilidade

### 📊 Monitoramento

O Vercel oferece:

- **Analytics** integrado
- **Logs** em tempo real das funções
- **Métricas** de performance
- **Uptime** de 99.9%

### 🔄 Atualizações Automáticas

Cada push para o branch principal irá:

1. Triggerar novo build automaticamente
2. Atualizar a aplicação sem downtime
3. Manter histórico de versões

### 💡 Benefícios da Arquitetura Serverless

- **Escalabilidade**: Escala automaticamente com demanda
- **Performance**: CDN global + funções otimizadas
- **Custo**: Paga apenas pelo que usar
- **Manutenção**: Zero servidor para gerenciar

### 🆘 Solução de Problemas

#### Erro de Build
```bash
# Verifique se todas as dependências estão instaladas
npm install

# Execute o build localmente primeiro
node build-vercel-fullstack.js
```

#### Erro de API
- Verifique se `DATABASE_URL` está configurada corretamente
- Teste a conexão com Supabase
- Veja os logs no painel do Vercel

#### Erro de Frontend
- Confirme que `vite build` executa sem erros
- Verifique se todos os imports estão corretos

### 🎉 Resultado Final

Você terá uma aplicação completa de restaurante com:

- **Frontend profissional** com design mexicano
- **Backend robusto** com todas as funcionalidades
- **Database** confiável e escalável
- **Deploy global** em minutos

**Pronto para produção e uso real!** 🌮🚀