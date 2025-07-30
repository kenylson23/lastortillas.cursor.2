// Script para criar arquivo .env
import fs from 'fs'
import path from 'path'

console.log('🔧 Criando arquivo .env...')

const envContent = `# =====================================================
# Configuração do Supabase - Las Tortillas Mx
# =====================================================

# Supabase Configuration
SUPABASE_URL=https://seu-project-id.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# Database URLs (encontradas em Settings > Database do Supabase)
SUPABASE_DB_DIRECT_URL=postgresql://postgres:[sua-senha]@db.[project-id].supabase.co:5432/postgres
SUPABASE_DB_URL=postgresql://postgres.[project-id]:[sua-senha]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Environment
NODE_ENV=development
PORT=5000

# =====================================================
# INSTRUÇÕES:
# =====================================================
# 
# 1. Substitua [project-id] pelo ID do seu projeto Supabase
# 2. Substitua [sua-senha] pela senha do banco de dados
# 3. Substitua sua-anon-key-aqui pela chave anônima
# 4. Substitua sua-service-role-key-aqui pela chave de serviço
#
# Para obter essas informações:
# 1. Acesse o Supabase Dashboard
# 2. Vá em Settings > API
# 3. Copie Project URL, anon public key e service_role secret key
# 4. Vá em Settings > Database
# 5. Copie as connection strings
#
# =====================================================
`

try {
  fs.writeFileSync('.env', envContent)
  console.log('✅ Arquivo .env criado com sucesso!')
  console.log('📝 Agora edite o arquivo .env com suas credenciais do Supabase')
  console.log('🔗 Acesse: https://supabase.com/dashboard para obter as credenciais')
} catch (error) {
  console.error('❌ Erro ao criar arquivo .env:', error.message)
  console.log('📋 Copie manualmente o conteúdo de env-template.txt para um arquivo .env')
} 