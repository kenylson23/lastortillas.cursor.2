#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando projeto Next.js para deploy na Vercel...\n');

// Files to rename for Next.js setup
const filesToRename = [
  {
    from: 'package-nextjs-optimized.json',
    to: 'package.json',
    backup: 'package-express.json'
  },
  {
    from: 'next.config.optimized.js',
    to: 'next.config.js'
  },
  {
    from: 'tailwind.config.nextjs.js',
    to: 'tailwind.config.js',
    backup: 'tailwind.config.express.js'
  },
  {
    from: 'postcss.config.nextjs.js',
    to: 'postcss.config.js'
  },
  {
    from: 'tsconfig.nextjs.json',
    to: 'tsconfig.json',
    backup: 'tsconfig.express.json'
  },
  {
    from: 'drizzle.config.nextjs.ts',
    to: 'drizzle.config.ts',
    backup: 'drizzle.config.express.ts'
  },
  {
    from: 'vercel-optimized.json',
    to: 'vercel.json',
    backup: 'vercel-express.json'
  }
];

function backupExistingFile(originalPath, backupPath) {
  if (fs.existsSync(originalPath)) {
    fs.copyFileSync(originalPath, backupPath);
    console.log(`✅ Backup criado: ${backupPath}`);
  }
}

function renameFile(fromPath, toPath, backupPath) {
  try {
    // Create backup if needed
    if (backupPath) {
      backupExistingFile(toPath, backupPath);
    }
    
    // Copy new file
    if (fs.existsSync(fromPath)) {
      fs.copyFileSync(fromPath, toPath);
      console.log(`✅ Configurado: ${toPath}`);
    } else {
      console.log(`⚠️  Arquivo não encontrado: ${fromPath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao configurar ${toPath}:`, error.message);
  }
}

// Rename all files
console.log('📁 Configurando arquivos do Next.js...\n');

filesToRename.forEach(({ from, to, backup }) => {
  renameFile(from, to, backup);
});

// Create .env.local from template if it doesn't exist
if (!fs.existsSync('.env.local') && fs.existsSync('.env.local.template')) {
  fs.copyFileSync('.env.local.template', '.env.local');
  console.log('✅ Criado: .env.local (configurar variáveis de ambiente)');
}

// Create public/uploads directory if it doesn't exist
const uploadsDir = path.join('public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(uploadsDir, '.gitkeep'), '# Keep this directory');
  console.log('✅ Criado: public/uploads/');
}

console.log('\n🎉 Configuração do Next.js concluída!\n');

console.log('📋 Próximos passos:');
console.log('1. Configure as variáveis de ambiente em .env.local');
console.log('2. Execute: npm install');
console.log('3. Execute: npm run db:push');
console.log('4. Execute: npm run dev');
console.log('5. Conecte seu repositório Git à Vercel');
console.log('6. Configure as variáveis de ambiente na Vercel');
console.log('7. Faça o deploy!\n');

console.log('📖 Documentação completa: README-NEXTJS-VERCEL.md\n');

console.log('🌟 Las Tortillas Mexican Grill está pronto para a Vercel!');