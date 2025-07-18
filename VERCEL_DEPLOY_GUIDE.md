# Guia de Deploy no Vercel - Las Tortillas Mexican Grill

## Configuração Corrigida

✅ **Problemas Resolvidos:**
- Comando Vite não encontrado durante build
- Dependências de build ausentes
- Script de build personalizado criado
- Configuração TypeScript otimizada

## Como Fazer Deploy

### 1. Configuração de Segredos no Vercel

Antes de fazer deploy, configure estas variáveis de ambiente no Vercel:

```bash
DATABASE_URL=postgresql://usuario:senha@host:5432/database
PGHOST=host-do-banco
PGPORT=5432
PGUSER=usuario
PGPASSWORD=senha
PGDATABASE=nome-do-banco
```

### 2. Deploy Manual

1. **Instale o Vercel CLI:**
```bash
npm install -g vercel
```

2. **Faça login no Vercel:**
```bash
vercel login
```

3. **Execute o deploy:**
```bash
vercel --prod
```

### 3. Deploy via Dashboard

1. Conecte seu repositório no dashboard do Vercel
2. As configurações já estão prontas no `vercel.json`
3. O build será executado automaticamente

## Arquivos Criados/Alterados

- `vercel.json` - Configuração do Vercel atualizada
- `build-vercel.js` - Script de build personalizado
- `tsconfig.vercel.json` - Configuração TypeScript para build

## Estrutura de Build

```
dist/
├── public/          # Frontend (HTML, CSS, JS)
│   ├── index.html
│   └── assets/
├── index.js         # Backend compilado
└── ...
```

## Verificação Local

Para testar o build localmente:
```bash
node build-vercel.js
```

## Funcionalidades Disponíveis

- ✅ Frontend React com Vite
- ✅ Backend Express.js
- ✅ API endpoints serverless
- ✅ Banco de dados PostgreSQL
- ✅ Autenticação e sessões
- ✅ Upload de arquivos
- ✅ Sistema de pedidos e reservas

## Próximos Passos

1. Configure as variáveis de ambiente no Vercel
2. Execute o deploy
3. Teste as funcionalidades no ambiente de produção
4. Configure domínio personalizado (opcional)

## Suporte

Se encontrar problemas durante o deploy, verifique:
- Variáveis de ambiente configuradas
- Logs de build no dashboard do Vercel
- Conectividade com banco de dados