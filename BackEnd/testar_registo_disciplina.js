/**
 * testar_registo_disciplina.js
 * 
 * Script para testar se o backend está recebendo e salvando area_especialidade
 * Execute: node testar_registo_disciplina.js
 */

import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/auth/registro-colaborador';

async function testarRegisto() {
  console.log('🧪 TESTE DE REGISTO COM DISCIPLINA\n');
  console.log('📍 Enviando para:', API_URL);

  // Criar FormData com todos os campos
  const formData = new FormData();
  
  const testData = {
    nome: 'Teste Disciplina User',
    username: 'teste_disc_' + Date.now(),
    email: `teste_disciplina_${Date.now()}@test.com`,
    telefone: '923456789',
    password: 'TestPass123!@#',
    confirmPassword: 'TestPass123!@#',
    area_especialidade: 'matematica',  // ← DISCIPLINA
    nivel_academico: 'licenciado',
    sexo: 'Masculino',
    nascimento: '1990-01-15',
    biografia: 'Isto é uma biografia de teste com mais de 30 caracteres para validação.',
  };

  console.log('📤 DADOS SENDO ENVIADOS:');
  Object.entries(testData).forEach(([k, v]) => {
    console.log(`   ${k}: ${v}`);
    formData.append(k, v);
  });

  try {
    console.log('\n⏳ Enviando requisição...\n');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    const json = await response.json();

    console.log('📊 RESPOSTA DO SERVIDOR:');
    console.log(`   Status: ${response.status}`);
    console.log('   Corpo:', JSON.stringify(json, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCESSO! Colaborador criado.');
      console.log(`   ID: ${json.data?.id}`);
      console.log(`   Email: ${json.data?.email}`);
      console.log(`   Disciplina: ${json.data?.disciplina_colaborador || 'NÃO APARECE'}`);
    } else {
      console.log('\n❌ ERRO! Resposta não OK.');
      if (json.fieldErrors) {
        console.log('   Erros de campo:', json.fieldErrors);
      }
    }

  } catch (err) {
    console.error('❌ ERRO DE REQUISIÇÃO:', err.message);
    console.error('\n💡 Dica: Certifique-se de que o backend está rodando em http://localhost:3000');
  }
}

console.log('═══════════════════════════════════════════════════════════════\n');
testarRegisto().then(() => {
  console.log('\n═══════════════════════════════════════════════════════════════');
});
