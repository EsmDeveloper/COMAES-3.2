#!/usr/bin/env node
/**
 * Script para testar a API de Suporte (SupportChat)
 * Uso: node test-support-api.js <token> [mensagem]
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:3002';
const ENDPOINT = '/api/support/chat';

// Argumentos da linha de comando
const token = process.argv[2];
const message = process.argv[3] || 'Olá, como funciona a COMAES?';

if (!token) {
  console.error('❌ Erro: Token JWT não fornecido');
  console.error('Uso: node test-support-api.js <JWT_TOKEN> [mensagem]');
  process.exit(1);
}

async function testSupportAPI() {
  console.log('🧪 Testando API de Suporte da COMAES');
  console.log('═══════════════════════════════════');
  console.log(`📍 URL: ${API_BASE}${ENDPOINT}`);
  console.log(`📝 Mensagem: "${message}"`);
  console.log(`🔐 Token: ${token.substring(0, 20)}...`);
  console.log('');

  try {
    console.log('⏳ Enviando requisição...');
    const response = await fetch(`${API_BASE}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: message,
        history: []
      }),
    });

    console.log(`📊 Status HTTP: ${response.status} ${response.statusText}`);

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('\n✅ Sucesso!');
      console.log('');
      console.log('📋 Resposta da IA:');
      console.log('─────────────────────────────────');
      console.log(data.response);
      console.log('─────────────────────────────────');
    } else {
      console.log('\n❌ Erro na resposta:');
      console.log('   Status:', data.success === false ? 'Falha' : 'Inesperado');
      console.log('   Erro:', data.error || 'Não especificado');
      if (data.debug) {
        console.log('   Debug:', data.debug);
      }
    }

  } catch (error) {
    console.error('\n❌ Erro na requisição:');
    console.error('   Tipo:', error.name);
    console.error('   Mensagem:', error.message);
    console.error('');
    console.error('💡 Dicas:');
    console.error('   1. Verifique se o backend está rodando na porta 3002');
    console.error('   2. Verifique se a chave GEMINI_API_KEY está configurada em .env');
    console.error('   3. Verifique se o token JWT é válido');
  }
}

testSupportAPI();
