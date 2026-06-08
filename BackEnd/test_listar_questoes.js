/**
 * test_listar_questoes.js
 * Script para testar listagem de questões via API
 */

import Usuario from './models/User.js';
import jwt from 'jsonwebtoken';
import db from './config/db.js';

async function test() {
  try {
    console.log('='.repeat(80));
    console.log('🧪 TESTE: Listar Questões via API');
    console.log('='.repeat(80));

    // 1. Conectar
    await db.authenticate();
    console.log('✅ Banco conectado!');

    // 2. Encontrar colaborador
    const colaborador = await Usuario.findOne({
      where: { role: 'colaborador', status_colaborador: 'aprovado' }
    });

    if (!colaborador) {
      console.error('❌ Nenhum colaborador encontrado!');
      process.exit(1);
    }

    console.log(`✅ Colaborador: ${colaborador.nome} (ID=${colaborador.id})`);

    // 3. Gerar token
    const token = jwt.sign(
      { id: colaborador.id, role: 'colaborador', status_colaborador: 'aprovado', disciplina_colaborador: colaborador.disciplina_colaborador },
      process.env.JWT_SECRET || 'comaes_jwt_secret_2026',
      { expiresIn: '24h' }
    );

    // 4. GET questões
    console.log('\n📡 Fazendo GET para /api/colaborador/questoes...');
    const response = await fetch('http://localhost:3001/api/colaborador/questoes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status: ${response.status}`);

    const data = await response.json();
    
    if (response.ok) {
      console.log(`\n✅ SUCESSO!`);
      console.log(`Total de questões: ${data.dados.paginacao.total}`);
      console.log(`Questões nesta página: ${data.dados.questoes.length}`);
      
      if (data.dados.questoes.length > 0) {
        console.log('\n📋 Primeira questão:');
        const q = data.dados.questoes[0];
        console.log(`  ID: ${q.id}`);
        console.log(`  Título: ${q.titulo}`);
        console.log(`  Status: ${q.status_aprovacao}`);
        console.log(`  Dificuldade: ${q.dificuldade}`);
        console.log(`  Data criação: ${q.created_at}`);
      }
    } else {
      console.error(`❌ FALHA!`);
      console.error('Erro:', data.mensagem);
    }

    process.exit(response.ok ? 0 : 1);
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    process.exit(1);
  }
}

test();
