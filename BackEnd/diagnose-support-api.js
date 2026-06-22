#!/usr/bin/env node
/**
 * Script de diagnóstico para API de Suporte
 * Verifica: .env, Gemini API, conexão, etc.
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';

dotenv.config();

console.log('🔍 DIAGNÓSTICO DA API DE SUPORTE DA COMAES');
console.log('═══════════════════════════════════════════\n');

// 1. Verificar .env
console.log('1️⃣ Verificando arquivo .env...');
const geminiKey = process.env.GEMINI_API_KEY;
if (!geminiKey) {
  console.error('❌ GEMINI_API_KEY não configurada em .env');
  process.exit(1);
} else {
  console.log(`✅ Chave encontrada: ${geminiKey.substring(0, 20)}...`);
}

// 2. Verificar formato da chave
console.log('\n2️⃣ Validando formato da chave...');
if (geminiKey.startsWith('AIza')) {
  console.log('✅ Formato correto (começa com AIza)');
} else {
  console.warn('⚠️ Formato suspeito (deveria começar com AIza)');
}

// 3. Testar inicialização do Gemini
console.log('\n3️⃣ Inicializando Google Generative AI...');
try {
  const genAI = new GoogleGenerativeAI(geminiKey);
  console.log('✅ GoogleGenerativeAI inicializado com sucesso');
  
  // 4. Testar modelo
  console.log('\n4️⃣ Verificando disponibilidade do modelo gemini-2.5-flash...');
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
    console.log('✅ Modelo gemini-2.5-flash carregado');
    
    // 5. Teste de requisição simples
    console.log('\n5️⃣ Enviando teste de requisição...');
    const result = await model.generateContent('Responda apenas com OK');
    
    if (result.response && result.response.text()) {
      console.log('✅ Requisição bem-sucedida!');
      console.log(`   Resposta: "${result.response.text()}"`);
    }
    
  } catch (modelError) {
    console.error('❌ Erro ao usar o modelo:');
    console.error('   Tipo:', modelError.name);
    console.error('   Mensagem:', modelError.message);
    
    if (modelError.message?.includes('API_KEY_INVALID')) {
      console.error('   👉 A chave GEMINI_API_KEY é INVÁLIDA');
    }
    if (modelError.message?.includes('RESOURCE_EXHAUSTED')) {
      console.error('   👉 Limite de requisições excedido');
    }
    if (modelError.message?.includes('PERMISSION_DENIED')) {
      console.error('   👉 Permissão negada - verifique a chave');
    }
  }
  
} catch (error) {
  console.error('❌ Erro ao inicializar GoogleGenerativeAI:');
  console.error('   Tipo:', error.name);
  console.error('   Mensagem:', error.message);
}

// 6. Verificar conexão ao backend
console.log('\n6️⃣ Testando conexão ao backend...');
try {
  const backendUrl = 'http://localhost:3002/api/support/chat';
  console.log(`   URL: ${backendUrl}`);
  
  // Não é possível testar sem token, mas pelo menos verifica se está ouvindo
  const response = await fetch('http://localhost:3002');
  if (response.ok || response.status === 404) {
    console.log('✅ Backend está respondendo na porta 3002');
  }
} catch (error) {
  console.error('❌ Backend não está respondendo:');
  console.error('   Verifique se está rodando com: npm start');
}

// 7. Resumo
console.log('\n═══════════════════════════════════════════');
console.log('📋 RESUMO:');
console.log('═══════════════════════════════════════════');
console.log('✅ Se tudo passou, a API deveria funcionar');
console.log('❌ Se algum teste falhou, veja a mensagem acima');

console.log('\n💡 PRÓXIMOS PASSOS:');
console.log('1. Certifique-se que GEMINI_API_KEY está correta em .env');
console.log('2. Verifique se a chave não expirou no Google Cloud');
console.log('3. Reinicie o backend: npm start');
console.log('4. Tente novamente no frontend');

process.exit(0);
