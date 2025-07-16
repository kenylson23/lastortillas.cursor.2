#!/bin/bash
echo "🚀 Building for Vercel..."

# Build with Vite
echo "📦 Building frontend..."
npx vite build

# Handle directory structure
if [ -d "dist/public" ]; then
  echo "📁 Moving files from dist/public to dist..."
  mv dist/public/* dist/
  rmdir dist/public
fi

# Create 404.html for SPA routing
if [ -f "dist/index.html" ]; then
  echo "🔄 Creating 404.html for SPA routing..."
  cp dist/index.html dist/404.html
fi

echo "✅ Build completed successfully!"