#!/bin/bash

# Script para configurar segredos do Vercel
echo "🔐 Configurando segredos do Vercel..."

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar se está logado no Vercel
echo "🔍 Verificando login no Vercel..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Não está logado no Vercel. Execute: vercel login"
    exit 1
fi

echo "✅ Logado no Vercel"

# Configurar DATABASE_URL
echo "🗄️ Configurando DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não está definido no ambiente local"
    echo "Por favor, defina DATABASE_URL primeiro:"
    echo "export DATABASE_URL=\"postgresql://user:password@host:port/database\""
    exit 1
fi

# Adicionar DATABASE_URL ao Vercel
echo "📤 Adicionando DATABASE_URL ao Vercel..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL production

if [ $? -eq 0 ]; then
    echo "✅ DATABASE_URL configurado no Vercel"
else
    echo "❌ Erro ao configurar DATABASE_URL"
    exit 1
fi

# Configurar outras variáveis se necessário
echo "📤 Configurando outras variáveis..."
echo "production" | vercel env add NODE_ENV production

echo "🎉 Segredos configurados com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute: vercel --prod"
echo "2. Teste as APIs: https://seu-app.vercel.app/api/menu-items"
echo "3. Execute: node scripts/setup-vercel-db.js (se necessário)"