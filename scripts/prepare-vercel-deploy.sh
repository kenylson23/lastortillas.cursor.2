#!/bin/bash

# Script para preparar deploy completo no Vercel
echo "🚀 Preparando deploy completo para Vercel..."

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf dist/
rm -rf .vercel/

# Verificar estrutura de arquivos necessários
echo "📋 Verificando estrutura de arquivos..."

# Verificar se arquivos essenciais existem
REQUIRED_FILES=(
    "vercel.json"
    "package.json"
    "lib/db.ts"
    "shared/schema.ts"
    "api/menu-items.ts"
    "api/orders.ts"
    "api/reservations.ts"
    "api/tables.ts"
    "api/health.ts"
    "src/App.tsx"
    "src/main.tsx"
    "index.html"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "❌ Arquivos essenciais ausentes:"
    printf '%s\n' "${MISSING_FILES[@]}"
    exit 1
fi

echo "✅ Todos os arquivos essenciais encontrados"

# Verificar dependências críticas
echo "🔍 Verificando dependências críticas..."
CRITICAL_DEPS=("@vercel/node" "pg" "drizzle-orm" "react" "vite")

for dep in "${CRITICAL_DEPS[@]}"; do
    if ! grep -q "\"$dep\"" package.json; then
        echo "❌ Dependência crítica ausente: $dep"
        exit 1
    fi
done

echo "✅ Dependências críticas verificadas"

# Build do frontend
echo "📦 Executando build do frontend..."
vite build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build do frontend"
    exit 1
fi

echo "✅ Build do frontend concluído"

# Verificar se build foi bem-sucedido
if [ ! -d "dist" ]; then
    echo "❌ Diretório de build não encontrado"
    exit 1
fi

# Verificar arquivos no build
BUILD_FILES=("dist/public/index.html" "dist/public/assets")

for file in "${BUILD_FILES[@]}"; do
    if [ ! -e "$file" ]; then
        echo "❌ Arquivo de build ausente: $file"
        exit 1
    fi
done

echo "✅ Build verificado com sucesso"

# Mostrar estatísticas do build
echo "📊 Estatísticas do build:"
echo "• Arquivos HTML: $(find dist/public -name "*.html" | wc -l)"
echo "• Arquivos JS: $(find dist/public -name "*.js" | wc -l)"
echo "• Arquivos CSS: $(find dist/public -name "*.css" | wc -l)"
echo "• Tamanho total: $(du -sh dist/public | cut -f1)"

# Verificar serverless functions
echo "🔧 Verificando serverless functions..."
API_FILES=($(find api -name "*.ts" -type f))

if [ ${#API_FILES[@]} -eq 0 ]; then
    echo "❌ Nenhuma serverless function encontrada"
    exit 1
fi

echo "✅ Serverless functions encontradas: ${#API_FILES[@]}"

# Verificar configuração do Vercel
echo "⚙️ Verificando configuração do Vercel..."
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json não encontrado"
    exit 1
fi

# Verificar se vercel.json é válido
if ! node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8'))" 2>/dev/null; then
    echo "❌ vercel.json inválido"
    exit 1
fi

echo "✅ Configuração do Vercel verificada"

# Verificar se .vercelignore existe
if [ -f ".vercelignore" ]; then
    echo "✅ .vercelignore configurado"
else
    echo "⚠️ .vercelignore não encontrado (opcional)"
fi

# Resumo final
echo ""
echo "🎉 Preparação para deploy concluída com sucesso!"
echo ""
echo "📋 Resumo do que está pronto:"
echo "• ✅ Frontend React construído"
echo "• ✅ Serverless Functions configuradas"
echo "• ✅ Database schema definido"
echo "• ✅ Configuração do Vercel otimizada"
echo "• ✅ Arquivos de build verificados"
echo ""
echo "🚀 Próximos passos:"
echo "1. Configurar DATABASE_URL no Vercel"
echo "2. Executar: vercel --prod"
echo "3. Testar: curl https://seu-app.vercel.app/api/health"
echo "4. Aplicar schema: npm run db:push"
echo ""
echo "✨ Pronto para deploy!"