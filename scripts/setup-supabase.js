#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configuração do Supabase - Las Tortillas Mx');
console.log('================================================\n');

// Verificar se o arquivo .env já existe
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  Arquivo .env já existe!');
  console.log('Por favor, edite manualmente com as credenciais do Supabase.\n');
} else {
  console.log('📝 Criando arquivo .env...');
  
  const envContent = `# Supabase Configuration
# Substitua pelos valores reais do seu projeto Supabase

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (encontrada em Settings > Database)
SUPABASE_DB_URL=postgresql://postgres:[sua-senha]@db.[project-id].supabase.co:5432/postgres

# Environment
NODE_ENV=development
PORT=5000
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env criado!');
  console.log('📋 Edite o arquivo .env com suas credenciais do Supabase\n');
}

console.log('📋 Próximos passos:');
console.log('1. Crie um projeto no Supabase (supabase.com)');
console.log('2. Copie as credenciais para o arquivo .env');
console.log('3. Execute: npm run db:push');
console.log('4. Execute: npm run dev');
console.log('5. Acesse: http://localhost:5000\n');

console.log('🔗 Links úteis:');
console.log('- Supabase Dashboard: https://supabase.com/dashboard');
console.log('- Documentação: https://supabase.com/docs');
console.log('- Guia completo: MIGRACAO_SUPABASE.md\n');

console.log('🎯 Status: ✅ Dependências instaladas');
console.log('⏳ Próximo: Configurar credenciais do Supabase');