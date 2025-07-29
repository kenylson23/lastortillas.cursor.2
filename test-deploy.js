#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Testando configuração para deploy no Vercel...\n');

// Verificar arquivos essenciais
const requiredFiles = [
  'vercel.json',
  'client/package.json',
  'client/vite.config.ts',
  'client/index.html',
  'api/availability.ts',
  'api/reservations.ts',
  'api/orders.ts',
  'api/menu.ts',
  'api/auth.ts',
  'api/contact.ts',
  'shared/schema.ts',
  'shared/supabase.ts'
];

let allFilesExist = true;

console.log('📁 Verificando arquivos essenciais:');
for (const file of requiredFiles) {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
}

console.log('\n📋 Verificando configurações:');

// Verificar vercel.json
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('✅ vercel.json válido');
} catch (error) {
  console.log('❌ vercel.json inválido:', error.message);
  allFilesExist = false;
}

// Verificar client/package.json
try {
  const clientPackage = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
  console.log('✅ client/package.json válido');
} catch (error) {
  console.log('❌ client/package.json inválido:', error.message);
  allFilesExist = false;
}

// Verificar client/vite.config.ts
try {
  const viteConfig = fs.readFileSync('client/vite.config.ts', 'utf8');
  if (viteConfig.includes('@vitejs/plugin-react')) {
    console.log('✅ client/vite.config.ts configurado corretamente');
  } else {
    console.log('❌ client/vite.config.ts não tem plugin React');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ Erro ao ler client/vite.config.ts:', error.message);
  allFilesExist = false;
}

console.log('\n🎯 Status do Deploy:');
if (allFilesExist) {
  console.log('✅ PRONTO PARA DEPLOY!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Fazer commit das mudanças');
  console.log('2. Push para GitHub');
  console.log('3. Conectar repositório no Vercel');
  console.log('4. Configurar variáveis de ambiente');
  console.log('5. Deploy automático!');
} else {
  console.log('❌ CONFIGURAÇÃO INCOMPLETA');
  console.log('\n🔧 Corrija os problemas acima antes do deploy');
}

console.log('\n📞 Links úteis:');
console.log('- Vercel: https://vercel.com');
console.log('- Documentação: https://vercel.com/docs');
console.log('- Guia completo: DEPLOY_VERCEL.md');