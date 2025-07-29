# 🚀 Guia de Configuração Local - Las Tortillas Mx

## 📋 Pré-requisitos

### 1. **Node.js e npm**
- ✅ Já instalado (verificado)

### 2. **PostgreSQL** (Necessário)
Você precisa instalar o PostgreSQL para o banco de dados.

#### **Opção A: Instalação Manual**
1. Baixe o PostgreSQL em: https://www.postgresql.org/download/windows/
2. Instale com as configurações padrão
3. Anote a senha do usuário `postgres` durante a instalação

#### **Opção B: Usando Chocolatey (Recomendado)**
```powershell
# Instalar Chocolatey primeiro (se não tiver)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar PostgreSQL
choco install postgresql
```

#### **Opção C: Docker (Mais Simples)**
```powershell
# Instalar Docker Desktop primeiro
# Depois executar:
docker run --name postgres-lastortilhas -e POSTGRES_PASSWORD=password -e POSTGRES_DB=lastortilhas -p 5432:5432 -d postgres:15
```

## 🔧 Configuração do Projeto

### 1. **Criar arquivo .env**
Crie um arquivo `.env` na raiz do projeto com o conteúdo:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/lastortilhas

# Environment
NODE_ENV=development

# Server Configuration
PORT=5000
```

### 2. **Instalar dependências**
```bash
npm install
```

### 3. **Configurar banco de dados**
```bash
# Criar banco de dados
createdb lastortilhas

# Ou se usar Docker:
docker exec -it postgres-lastortilhas psql -U postgres -c "CREATE DATABASE lastortilhas;"

# Executar migrações
npm run db:push
```

### 4. **Iniciar o projeto**
```bash
npm run dev
```

## 🌐 Acessos

Após iniciar o projeto, você terá acesso a:

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

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Verificar tipos TypeScript
npm run check

# Atualizar banco de dados
npm run db:push
```

## 🐛 Solução de Problemas

### **Erro de conexão com banco**
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Teste a conexão: `psql -U postgres -d lastortilhas`

### **Erro de dependências**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### **Erro de porta em uso**
```bash
# Verificar processos na porta 5000
netstat -ano | findstr :5000
# Matar processo se necessário
taskkill /PID [PID_NUMBER] /F
```

## 📱 Funcionalidades Disponíveis

- ✅ Sistema de autenticação
- ✅ Cardápio digital
- ✅ Sistema de pedidos
- ✅ Painel da cozinha
- ✅ Painel administrativo
- ✅ Rastreamento de pedidos
- ✅ Upload de imagens
- ✅ Sistema de mesas

## 🎯 Próximos Passos

1. Instalar PostgreSQL
2. Criar arquivo `.env`
3. Executar `npm run db:push`
4. Iniciar com `npm run dev`
5. Acessar http://localhost:5000

---

**Status**: ✅ Dependências instaladas
**Próximo**: ⏳ Configurar PostgreSQL e banco de dados