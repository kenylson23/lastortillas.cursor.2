// Script de teste para verificar todas as APIs
const BASE_URL = 'http://localhost:3000'; // Para desenvolvimento local

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`✅ ${method} ${endpoint}:`, response.status, result);
    return { success: true, status: response.status, data: result };
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Iniciando testes das APIs...\n');

  // Teste 1: Menu Items
  console.log('📋 Testando Menu Items...');
  await testAPI('/api/menu', 'GET');
  
  // Teste 2: Tables
  console.log('\n🪑 Testando Tables...');
  await testAPI('/api/tables', 'GET');
  
  // Teste 3: Orders
  console.log('\n📦 Testando Orders...');
  await testAPI('/api/orders', 'GET');
  
  // Teste 4: Reservations
  console.log('\n📅 Testando Reservations...');
  await testAPI('/api/reservations?date=2024-01-15', 'GET');
  
  // Teste 5: Availability
  console.log('\n⏰ Testando Availability...');
  await testAPI('/api/availability?date=2024-01-15&time=19:00', 'GET');
  
  // Teste 6: Contact
  console.log('\n📞 Testando Contact...');
  await testAPI('/api/contact', 'POST', {
    name: 'Teste',
    email: 'teste@teste.com',
    message: 'Mensagem de teste'
  });

  console.log('\n🎉 Testes concluídos!');
}

// Executar testes se o arquivo for executado diretamente
if (typeof window === 'undefined') {
  runTests();
}

module.exports = { testAPI, runTests }; 