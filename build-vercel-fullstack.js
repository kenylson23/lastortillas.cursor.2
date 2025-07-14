#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building Las Tortillas for Vercel Full-Stack Deployment...');

try {
  // 1. Build the frontend with Vite
  console.log('📦 Building frontend...');
  execSync('vite build', { stdio: 'inherit' });

  // 2. Create .vercelignore file
  console.log('🚫 Creating .vercelignore...');
  const vercelIgnore = `
node_modules
.git
.replit
.env
dist/*.map
client/src
*.log
.DS_Store
attached_assets
scripts
build-*.js
drizzle.config.ts
tsconfig.json
vite.config.ts
tailwind.config.ts
postcss.config.js
components.json
README.md
SUPABASE_CONNECTION.md
VERCEL_BACKEND_OPTIONS.md
replit.md
`;

  fs.writeFileSync('.vercelignore', vercelIgnore.trim());

  // 3. Copy uploads directory if it exists
  if (fs.existsSync('public/uploads')) {
    console.log('📸 Copying uploads...');
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }
    execSync('cp -r public/uploads dist/', { stdio: 'inherit' });
  }

  // 4. Create a simple README for deployment
  console.log('📝 Creating deployment README...');
  const deploymentReadme = `# Las Tortillas Mexican Grill - Vercel Deployment

## Environment Variables Required

Add these environment variables in your Vercel dashboard:

\`\`\`
DATABASE_URL=your_supabase_connection_string
\`\`\`

## Deployment Steps

1. Connect your Git repository to Vercel
2. Add the DATABASE_URL environment variable
3. Deploy!

The application will automatically:
- Build the React frontend
- Deploy API endpoints as serverless functions
- Connect to your Supabase database

## API Endpoints

All API endpoints are available at \`/api/*\`:
- \`/api/menu-items\` - Menu management
- \`/api/orders\` - Order management  
- \`/api/tables\` - Table management
- \`/api/reservations\` - Reservation system
- \`/api/contacts\` - Contact forms

## Frontend

The React application is served as a static site with client-side routing.
`;

  fs.writeFileSync('DEPLOYMENT.md', deploymentReadme);

  console.log('✅ Build complete! Ready for Vercel deployment.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Push your code to Git');
  console.log('2. Connect to Vercel');
  console.log('3. Add DATABASE_URL environment variable');
  console.log('4. Deploy!');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}