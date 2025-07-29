# 🚀 Migração para Supabase - Las Tortillas Mx

## 📋 Passos para Configurar o Supabase

### 1. **Criar Projeto no Supabase**

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha as informações:
   - **Name**: `lastortilhas-mx`
   - **Database Password**: `sua-senha-segura`
   - **Region**: Escolha a mais próxima (ex: `us-east-1`)
5. Clique em "Create new project"

### 2. **Obter Credenciais do Projeto**

Após criar o projeto, vá em **Settings > API** e copie:

- **Project URL**: `https://[project-id].supabase.co`
- **Anon Key**: `eyJ...` (chave longa)
- **Service Role Key**: `eyJ...` (chave longa)

### 3. **Configurar Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URL (encontrada em Settings > Database)
SUPABASE_DB_URL=postgresql://postgres:[sua-senha]@db.[project-id].supabase.co:5432/postgres

# Environment
NODE_ENV=development
PORT=5000
```

### 4. **Instalar Dependências Atualizadas**

```bash
npm install
```

### 5. **Executar Migrações do Banco**

```bash
# Gerar migrações baseadas no schema
npm run db:generate

# Aplicar migrações ao Supabase
npm run db:push
```

### 6. **Configurar Storage (Opcional)**

Para upload de imagens, configure o Storage no Supabase:

1. Vá em **Storage** no dashboard
2. Crie um bucket chamado `menu-images`
3. Configure as políticas de acesso:

```sql
-- Política para permitir upload de imagens
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir visualização pública
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (true);
```

## 🔧 Configurações Adicionais

### **Configurar Autenticação (Opcional)**

Se quiser usar autenticação do Supabase:

1. Vá em **Authentication > Settings**
2. Configure os provedores desejados (Email, Google, etc.)
3. Atualize as URLs de redirecionamento

### **Configurar Row Level Security (RLS)**

Execute no SQL Editor do Supabase:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Allow public read access" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON orders FOR UPDATE USING (true);
```

## 🚀 Iniciar o Projeto

```bash
npm run dev
```

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:5000
- **Admin**: http://localhost:5000/admin
- **Cozinha**: http://localhost:5000/kitchen

## 🔑 Credenciais de Teste

### **Admin**
- **Usuário**: admin
- **Senha**: admin123

### **Cozinha**
- **Usuário**: kitchen
- **Senha**: kitchen123

## 📊 Monitoramento

### **Dashboard do Supabase**
- Acesse o dashboard do seu projeto
- Monitore logs, performance e uso
- Configure alertas se necessário

### **Logs da Aplicação**
```bash
# Ver logs em tempo real
npm run dev
```

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Verificar tipos
npm run check

# Gerar migrações
npm run db:generate

# Aplicar migrações
npm run db:push

# Reset do banco (cuidado!)
npm run db:reset
```

## 🐛 Solução de Problemas

### **Erro de Conexão**
1. Verifique se as credenciais do Supabase estão corretas
2. Confirme se o projeto está ativo
3. Teste a conexão no dashboard do Supabase

### **Erro de Migração**
```bash
# Reset das migrações
rm -rf migrations/
npm run db:generate
npm run db:push
```

### **Erro de Storage**
1. Verifique se o bucket foi criado
2. Confirme as políticas de acesso
3. Teste o upload via dashboard

## 📈 Vantagens do Supabase

- ✅ **Sem configuração local** de PostgreSQL
- ✅ **Backup automático** dos dados
- ✅ **Escalabilidade** automática
- ✅ **Dashboard** para monitoramento
- ✅ **Storage** para imagens
- ✅ **Autenticação** integrada
- ✅ **API REST** automática
- ✅ **Tempo real** com WebSockets

## 🎯 Próximos Passos

1. ✅ Criar projeto no Supabase
2. ✅ Configurar variáveis de ambiente
3. ✅ Executar migrações
4. ✅ Testar funcionalidades
5. ⏳ Configurar Storage (opcional)
6. ⏳ Configurar autenticação (opcional)

---

**Status**: ✅ Configuração básica do Supabase
**Próximo**: ⏳ Criar projeto e configurar credenciais