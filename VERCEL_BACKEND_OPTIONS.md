# Opções para Backend no Vercel

## Situação Atual

**Replit**: ✅ Frontend + Backend funcionando perfeitamente
**Vercel**: ❌ Apenas frontend estático (sem backend)

## Problema

O frontend no Vercel está fazendo chamadas para `/api/...` mas não há servidor para responder:
- `GET /api/menu-items` → 404 (menu não carrega)
- `GET /api/availability` → 404 (reservas não funcionam)
- `GET /api/tables` → 404 (mesas não carregam)
- `POST /api/orders` → 404 (pedidos não funcionam)

## Opções de Solução

### 1. **Deploy Full-Stack no Vercel** (Recomendado)
```bash
# Estrutura necessária:
/api/
  ├── menu-items.js
  ├── availability.js
  ├── tables.js
  └── orders.js
```

**Vantagens:**
- Sistema completo funcionando
- Todas as funcionalidades disponíveis
- Banco de dados Supabase conectado

**Desvantagens:**
- Mais complexo para configurar
- Precisa reconfigurar as rotas para Vercel Functions

### 2. **Modo Estático com WhatsApp** (Atual)
Remover funcionalidades que precisam de backend:
- Menu → Dados estáticos no código
- Reservas → Redirecionar para WhatsApp
- Pedidos → Redirecionar para WhatsApp

**Vantagens:**
- Deploy simples e rápido
- Funciona perfeitamente para apresentação
- Baixo custo

**Desvantagens:**
- Perde funcionalidades avançadas
- Não tem sistema de pedidos online

### 3. **Backend Externo** (Híbrido)
Hospedar backend em outro lugar:
- Vercel → Frontend estático
- Railway/Render → Backend Node.js
- Configurar CORS para comunicação

**Vantagens:**
- Separação clara de responsabilidades
- Pode usar diferentes provedores

**Desvantagens:**
- Mais complexo de manter
- Configuração de CORS necessária

## Recomendação

Para o Las Tortillas Mexican Grill, sugiro a **Opção 1 - Deploy Full-Stack no Vercel** porque:

1. ✅ Mantém todas as funcionalidades
2. ✅ Sistema de pedidos online funcionando
3. ✅ Conectado com Supabase
4. ✅ Experiência completa para os clientes

## Próximos Passos

Se escolher a Opção 1, preciso:
1. Converter as rotas Express para Vercel Functions
2. Configurar variáveis de ambiente no Vercel
3. Adaptar o build process
4. Testar conexão com Supabase

Qual opção você prefere?