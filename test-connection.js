// Teste de conexão com Supabase usando variáveis de ambiente
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Carregar variáveis de ambiente do arquivo .env
function loadEnv() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8')
    const env = {}
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && !key.startsWith('#')) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    })
    
    return env
  } catch (error) {
    console.error('❌ Erro ao carregar arquivo .env:', error.message)
    return {}
  }
}

const env = loadEnv()

// Configuração do Supabase
const supabaseUrl = env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = env.SUPABASE_ANON_KEY || 'your-anon-key'

console.log('🔍 Testando conexão com Supabase...')
console.log('URL:', supabaseUrl)
console.log('Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada')

if (!supabaseUrl || supabaseUrl.includes('your-project') || !supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
  console.error('❌ Variáveis de ambiente não configuradas corretamente!')
  console.log('💡 Verifique se o arquivo .env contém suas credenciais reais do Supabase')
  process.exit(1)
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n📡 Testando conexão...')
    
    // Teste básico de conexão
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message)
      console.log('💡 Verifique se:')
      console.log('   1. As credenciais estão corretas')
      console.log('   2. O projeto Supabase está ativo')
      console.log('   3. A tabela menu_items existe')
      return false
    }
    
    console.log('✅ Conexão estabelecida com sucesso!')
    console.log('📊 Dados encontrados:', data?.length || 0, 'registros')
    
    // Teste adicional: verificar outras tabelas
    console.log('\n📋 Verificando tabelas...')
    const tables = ['menu_items', 'orders', 'order_items', 'reservations', 'tables', 'users', 'sessions', 'contacts']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: Disponível`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    return false
  }
}

// Executar teste
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Teste de conexão concluído com sucesso!')
    console.log('🚀 Próximo passo: Execute o script setup-supabase.sql no Supabase Dashboard')
  } else {
    console.log('\n💥 Teste de conexão falhou!')
    console.log('\n📋 Próximos passos:')
    console.log('   1. Verifique se as credenciais no .env estão corretas')
    console.log('   2. Execute o script setup-supabase.sql no Supabase Dashboard')
    console.log('   3. Teste novamente a conexão')
  }
}) 