// Test script for Gemini API Key
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiKey() {
  console.log('🔍 Testando chave Gemini API...\n');

  // 1. Verificar se a chave está definida
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY não encontrada no .env');
    process.exit(1);
  }

  console.log('✅ Chave encontrada:', apiKey.substring(0, 15) + '...');
  console.log('   Tamanho:', apiKey.length, 'caracteres\n');

  // 2. Tentar inicializar o cliente
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Cliente GoogleGenerativeAI inicializado\n');

    // 3. Tentar obter o modelo
    console.log('🔄 Tentando acessar modelo gemini-2.5-flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✅ Modelo acessado com sucesso\n');

    // 4. Fazer um teste simples de geração
    console.log('🔄 Testando geração de conteúdo...');
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: 'Responda apenas: OK' }]
      }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 10
      }
    });

    const response = result.response.text();
    console.log('✅ Resposta recebida:', response);
    console.log('\n🎉 CHAVE VÁLIDA E FUNCIONAL!\n');
    
  } catch (error) {
    console.error('\n❌ ERRO ao testar a chave:\n');
    console.error('   Tipo:', error.name);
    console.error('   Mensagem:', error.message);
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid')) {
      console.error('\n⚠️  A chave parece ser INVÁLIDA');
      console.error('   Verifique se copiou corretamente do Google AI Studio');
    } else if (error.message?.includes('RESOURCE_EXHAUSTED')) {
      console.error('\n⚠️  Limite de requisições atingido');
      console.error('   Aguarde alguns minutos e tente novamente');
    } else {
      console.error('\n⚠️  Erro desconhecido - verifique sua conexão');
    }
    
    process.exit(1);
  }
}

testGeminiKey();
