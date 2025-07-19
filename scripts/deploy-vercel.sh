#!/bin/bash

# Script para deploy completo no Vercel
echo "🚀 Iniciando deploy completo no Vercel..."

# Verificar se vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Build local para verificar
echo "📦 Executando build local..."
vite build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build local"
    exit 1
fi

echo "✅ Build local bem-sucedido"

# Deploy para Vercel
echo "🚀 Fazendo deploy para Vercel..."
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Erro no deploy do Vercel"
    exit 1
fi

echo "✅ Deploy concluído com sucesso!"

# Instruções pós-deploy
echo ""
echo "📋 Próximos passos após o deploy:"
echo "1. Configurar DATABASE_URL no dashboard do Vercel"
echo "2. Executar: npm run db:push (localmente com DATABASE_URL do Vercel)"
echo "3. Testar as APIs: https://seu-app.vercel.app/api/menu-items"
echo ""
echo "🎉 Deploy concluído! Verifique a aplicação no dashboard do Vercel."