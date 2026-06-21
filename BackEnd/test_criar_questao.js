/**
 * test_criar_questao.js
 * Script para testar criação de questão via API
 */

import db from './config/db.js';
import Usuario from './models/User.js';
import jwt from 'jsonwebtoken';

async function test() {
  try {
    console.log('='.repeat(80));
    console.log(' TESTE: Criar Questão via API');
    console.log('='.repeat(80));

    // 1. Conectar ao banco
    console.log('\n1â£ Conectando ao banco...');
    await db.authenticate();
    console.log('âœ… Banco conectado!');

    // 2. Encontrar colaborador
    console.log('\n2â£ Encontrando colaborador aprovado...');
    const colaborador = await Usuario.findOne({
      where: { role: 'colaborador', status_colaborador: 'aprovado' },
      attributes: ['id', 'nome', 'email', 'disciplina_colaborador']
    });

    if (!colaborador) {
      console.error('âŒ Nenhum colaborador encontrado!');
      process.exit(1);
    }

    console.log(`âœ… Encontrado: ${colaborador.nome} (ID=${colaborador.id})`);

    // 3. Gerar token JWT
    console.log('\n3â£ Gerando JWT token...');
    const token = jwt.sign(
      {
        id: colaborador.id,
        role: 'colaborador',
        status_colaborador: 'aprovado',
        disciplina_colaborador: colaborador.disciplina_colaborador
      },
      process.env.JWT_SECRET || 'comaes_jwt_secret_2026',
      { expiresIn: '24h' }
    );
    console.log('âœ… Token gerado!');
    console.log(`Token (primeiros 30 chars): ${token.substring(0, 30)}...`);

    // 4. Construir payload de questão
    const questaoPayload = {
      titulo: 'Teste Questão Matemática',
      enunciado: 'Qual é a resposta correta?',
      descricao: 'Esta é uma questão de teste criada via script',
      tipo: 'multipla_escolha',
      dificuldade: 'facil',
      disciplina: colaborador.disciplina_colaborador,
      opcoes: ['A', 'B', 'C', 'D'],
      resposta_correta: 'B',
      pontos: 10,
      explicacao: 'A resposta correta é B porque...'
    };

    console.log('\n4â£ Payload da questão:');
    console.log(JSON.stringify(questaoPayload, null, 2));

    // 5. Fazer request POST
    console.log('\n5â£ Fazendo POST para /api/colaborador/questoes...');
    const response = await fetch('http://localhost:3002/api/colaborador/questoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(questaoPayload)
    });

    console.log(`Status: ${response.status}`);

    const data = await response.json();
    console.log('\nResposta do servidor:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\nâœ… TESTE SUCESSO!');
      console.log(`Questão criada com ID: ${data.dados?.id}`);
    } else {
      console.error('\nâŒ TESTE FALHOU!');
      console.error(`Erro: ${data.mensagem}`);
    }

    process.exit(response.ok ? 0 : 1);
  } catch (error) {
    console.error('\nâŒ ERRO:');
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

test();

