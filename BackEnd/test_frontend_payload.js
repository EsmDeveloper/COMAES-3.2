/**
 * test_frontend_payload.js
 * Testa com EXATAMENTE o payload que o frontend envia
 */

import Usuario from './models/User.js';
import jwt from 'jsonwebtoken';
import db from './config/db.js';

async function test() {
  try {
    console.log('='.repeat(80));
    console.log('ðŸ§ª TESTE: Payload do Frontend');
    console.log('='.repeat(80));

    await db.authenticate();
    
    const colaborador = await Usuario.findOne({
      where: { role: 'colaborador', status_colaborador: 'aprovado' }
    });

    if (!colaborador) {
      console.error('âŒ Nenhum colaborador');
      process.exit(1);
    }

    console.log(`âœ… Colaborador: ${colaborador.nome}`);

    const token = jwt.sign(
      { id: colaborador.id, role: 'colaborador', status_colaborador: 'aprovado', disciplina_colaborador: colaborador.disciplina_colaborador },
      process.env.JWT_SECRET || 'comaes_jwt_secret_2026',
      { expiresIn: '24h' }
    );

    // PAYLOAD EXATO DO FRONTEND (apÃ³s correÃ§Ã£o)
    const frontendPayload = {
      titulo: "Teste do Frontend",
      enunciado: "Qual Ã© a capital da FranÃ§a?",
      disciplina: colaborador.disciplina_colaborador,
      dificuldade: "medio",
      tipo: "multipla_escolha",
      opcoes: ["Paris", "Londres", "Berlim", "Madrid"],
      resposta_correta: "Paris",
      pontos: 15
    };

    console.log('\nðŸ“‹ Payload do Frontend:');
    console.log(JSON.stringify(frontendPayload, null, 2));

    console.log('\nðŸ“¡ POST /api/colaborador/questoes...');
    const response = await fetch('http://localhost:3002/api/colaborador/questoes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(frontendPayload)
    });

    console.log(`Status: ${response.status}`);

    const data = await response.json();
    
    if (response.ok) {
      console.log('\nâœ… SUCESSO!');
      console.log(`QuestÃ£o criada com ID: ${data.dados.id}`);
    } else {
      console.error(`\nâŒ FALHA!`);
      console.error('Erro:', JSON.stringify(data, null, 2));
    }

    process.exit(response.ok ? 0 : 1);
  } catch (error) {
    console.error('âŒ ERRO:', error.message);
    process.exit(1);
  }
}

test();

