/**
 * test_criar_questao.js
 * Script para testar criaÃ§Ã£o de questÃ£o via API
 */

import db from './config/db.js';
import Usuario from './models/User.js';
import jwt from 'jsonwebtoken';

async function test() {
  try {
    console.log('='.repeat(80));
    console.log('ðŸ§ª TESTE: Criar QuestÃ£o via API');
    console.log('='.repeat(80));

    // 1. Conectar ao banco
    console.log('\n1ï¸âƒ£ Conectando ao banco...');
    await db.authenticate();
    console.log('âœ… Banco conectado!');

    // 2. Encontrar colaborador
    console.log('\n2ï¸âƒ£ Encontrando colaborador aprovado...');
    const colaborador = await Usuario.findOne({
      where: { role: 'colaborador', status_colaborador: 'aprovado' },
      attributes: ['id', 'nome', 'email', 'disciplina_colaborador']
    });

    if (!colaborador) {
      console.error('âŒ Nenhum colaborador encontrado!');
      process.exit(1);
    }

    console.log(`âœ… Encontrado: ${colaborador.nome} (ID=${colaborador.id})`);

    // 3. Gerar token JWT
    console.log('\n3ï¸âƒ£ Gerando JWT token...');
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

    // 4. Construir payload de questÃ£o
    const questaoPayload = {
      titulo: 'Teste QuestÃ£o MatemÃ¡tica',
      enunciado: 'Qual Ã© a resposta correta?',
      descricao: 'Esta Ã© uma questÃ£o de teste criada via script',
      tipo: 'multipla_escolha',
      dificuldade: 'facil',
      disciplina: colaborador.disciplina_colaborador,
      opcoes: ['A', 'B', 'C', 'D'],
      resposta_correta: 'B',
      pontos: 10,
      explicacao: 'A resposta correta Ã© B porque...'
    };

    console.log('\n4ï¸âƒ£ Payload da questÃ£o:');
    console.log(JSON.stringify(questaoPayload, null, 2));

    // 5. Fazer request POST
    console.log('\n5ï¸âƒ£ Fazendo POST para /api/colaborador/questoes...');
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
      console.log(`QuestÃ£o criada com ID: ${data.dados?.id}`);
    } else {
      console.error('\nâŒ TESTE FALHOU!');
      console.error(`Erro: ${data.mensagem}`);
    }

    process.exit(response.ok ? 0 : 1);
  } catch (error) {
    console.error('\nâŒ ERRO:');
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

test();

