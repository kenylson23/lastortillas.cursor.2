#!/bin/bash

# Script de build otimizado para Vercel
echo "🔧 Iniciando build do Las Tortillas..."

# 1. Gerar Prisma Client
echo "📦 Gerando Prisma Client..."
npx prisma generate

# 2. Build do frontend em modo produção
echo "🏗️ Construindo frontend..."
vite build --mode production

# 3. Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Verificar arquivos gerados
    echo "📂 Arquivos gerados:"
    ls -la dist/
    
    exit 0
else
    echo "❌ Erro no build"
    exit 1
fi