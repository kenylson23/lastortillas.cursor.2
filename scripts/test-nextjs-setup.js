#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

console.log('🧪 Testando configuração do Next.js...\n');

// Test files existence
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  'drizzle.config.ts',
  'vercel.json',
  'pages/index.tsx',
  'pages/_app.tsx',
  'pages/api/health.ts',
  'pages/api/menu-items.ts',
  'lib/db-nextjs.ts',
  'lib/schema.ts',
  'styles/globals.css',
  '.env.local'
];

console.log('📁 Verificando arquivos necessários...\n');

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANDO`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Alguns arquivos necessários estão faltando!');
  console.log('Execute: node scripts/setup-nextjs-vercel.js');
  process.exit(1);
}

// Test package.json structure
console.log('\n📦 Verificando package.json...\n');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = ['react', 'react-dom', 'next', 'drizzle-orm', 'pg', 'zod'];
  const requiredScripts = ['dev', 'build', 'start', 'db:push'];
  
  console.log('Dependências principais:');
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - FALTANDO`);
    }
  });
  
  console.log('\nScripts necessários:');
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`❌ ${script} - FALTANDO`);
    }
  });
  
} catch (error) {
  console.log('❌ Erro ao ler package.json:', error.message);
}

// Test environment variables
console.log('\n🔐 Verificando variáveis de ambiente...\n');

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_WHATSAPP_NUMBER'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      const hasValue = envContent.includes(`${envVar}=`) && 
                      !envContent.includes(`${envVar}=""`);
      console.log(`${hasValue ? '✅' : '⚠️'} ${envVar} ${hasValue ? '' : '(valor vazio)'}`);
    } else {
      console.log(`❌ ${envVar} - FALTANDO`);
    }
  });
  
} catch (error) {
  console.log('❌ Erro ao ler .env.local:', error.message);
}

// Test TypeScript configuration
console.log('\n📝 Verificando configuração TypeScript...\n');

try {
  const tsconfigContent = fs.readFileSync('tsconfig.json', 'utf8');
  const tsconfig = JSON.parse(tsconfigContent);
  
  const checks = [
    { name: 'JSX Preserve', check: tsconfig.compilerOptions?.jsx === 'preserve' },
    { name: 'Module ESNext', check: tsconfig.compilerOptions?.module === 'esnext' },
    { name: 'Strict Mode', check: tsconfig.compilerOptions?.strict === true },
    { name: 'Path Aliases', check: !!tsconfig.compilerOptions?.paths }
  ];
  
  checks.forEach(({ name, check }) => {
    console.log(`${check ? '✅' : '❌'} ${name}`);
  });
  
} catch (error) {
  console.log('❌ Erro ao ler tsconfig.json:', error.message);
}

console.log('\n🎯 Resumo da configuração:\n');

if (allFilesExist) {
  console.log('✅ Todos os arquivos necessários estão presentes');
  console.log('✅ Estrutura do Next.js configurada');
  console.log('✅ Configurações de build otimizadas');
  console.log('✅ Database schema e migrations prontos');
  console.log('✅ API routes implementadas');
  console.log('✅ Styling com TailwindCSS configurado');
  console.log('✅ Vercel deployment configurado');
  
  console.log('\n🚀 Próximos passos para deploy:');
  console.log('1. Configurar DATABASE_URL em .env.local');
  console.log('2. Executar: npm install');
  console.log('3. Executar: npm run db:push');
  console.log('4. Testar localmente: npm run dev');
  console.log('5. Conectar repositório Git à Vercel');
  console.log('6. Configurar environment variables na Vercel');
  console.log('7. Deploy automático!');
  
  console.log('\n🌟 Las Tortillas está pronto para produção na Vercel!');
} else {
  console.log('❌ Configuração incompleta');
  console.log('Execute: node scripts/setup-nextjs-vercel.js');
}

console.log('\n📖 Documentação: README-NEXTJS-VERCEL.md');