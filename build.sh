#!/bin/bash
echo "🚀 Building for Vercel deployment..."

# Build only the frontend with Vite (skip server compilation)
echo "📦 Building frontend..."
NODE_ENV=production npx vite build --config vite.config.ts --mode production

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "❌ Build failed - no dist directory created"
  exit 1
fi

# Create 404.html for SPA routing
if [ -f "dist/index.html" ]; then
  echo "🔄 Creating 404.html for SPA routing..."
  cp dist/index.html dist/404.html
fi

# Create uploads directory if it doesn't exist
if [ ! -d "dist/uploads" ]; then
  echo "📁 Creating uploads directory..."
  mkdir -p dist/uploads
fi

echo "✅ Build completed successfully!"
echo "📂 Build output:"
ls -la dist/