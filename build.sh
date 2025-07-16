#!/bin/bash
set -e

echo "Building Las Tortillas for Vercel..."

# Build with Vite
npx vite build

# Move files from dist/public to dist
if [ -d "dist/public" ]; then
  mv dist/public/* dist/
  rmdir dist/public
fi

# Copy uploads
if [ -d "public/uploads" ]; then
  mkdir -p dist/uploads
  cp -r public/uploads/* dist/uploads/ 2>/dev/null || true
fi

# Create 404.html for SPA
if [ -f "dist/index.html" ]; then
  cp dist/index.html dist/404.html
fi

echo "Build completed successfully!"