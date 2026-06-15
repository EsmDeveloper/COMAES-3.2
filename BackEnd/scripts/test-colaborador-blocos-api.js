/**
 * test-colaborador-blocos-api.js
 * Testa o endpoint GET /api/colaborador/blocos diretamente
 * Simula uma requisição do frontend
 */

import sequelize from '../config/db.js';
import Usuario from '../models/User.js';
import BlocoQuestoes from '../models/BlocoQuestoes.js';
import setupAssociations from '../models/associations.js';
import jwt from 'jsonwebtoken';

setupAssociations();

async function testarEndpoint() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado\n');

    // Buscar um colaborador aprovado
    console.log('📋 Buscando colaborador aprovado...');
    const colaborador = await Usuario.findOne({
      where: {
        role: 'colaborador',
        status_colaborador: 'aprovado'
      }
    });

    if (!colaborador) {
      console.log('❌ Nenhum colaborador aprovado encontrado!');
      process.exit(1);
    }

    console.log(`✅ Encontrado: ${colaborador.email}`);
    console.log(`   ID: ${colaborador.id}`);
    console.log(`   Disciplina: ${colaborador.disciplina_colaborador}\n`);

    // Simular req.user (o que o middleware auth faz)
    const user = {
      id: colaborador.id,
      email: colaborador.email,
      role: 'colaborador',
      status_colaborador: colaborador.status_colaborador,
      disciplina_colaborador: colaborador.disciplina_colaborador
    };

    // Simular a query que o endpoint faz
    console.log('📝 Simulando query do endpoint listarBlocos...\n');

    const where = {
      criado_por: user.id,
      disciplina: user.disciplina_colaborador
    };

    console.log('WHERE clause:', JSON.stringify(where, null, 2));

    const result = await BlocoQuestoes.findAndCountAll({
      where,
      raw: true,
      limit: 20,
      offset: 0,
      order: [['createdAt', 'DESC']]
    });

    console.log(`\n✅ Query executada com sucesso!`);
    console.log(`   Total de blocos: ${result.count}`);
    console.log(`   Blocos retornados: ${result.rows.length}\n`);

    if (result.rows.length > 0) {
      console.log('📊 Primeiros blocos:');
      result.rows.slice(0, 3).forEach((b, i) => {
        console.log(`   ${i + 1}. ${b.titulo} (status: ${b.status_aprovacao})`);
      });
    } else {
      console.log('ℹ️  Nenhum bloco criado por este colaborador (isso é normal!)');
    }

    // Testar com include (como o endpoint real faz)
    console.log('\n📝 Testando com includes (BlocoQuestaoItem, Questao)...\n');

    try {
      const resultFull = await BlocoQuestoes.findAndCountAll({
        where,
        include: [
          {
            model: 'BlocoQuestaoItem',
            as: 'itens',
            attributes: ['id', 'questao_id', 'ordem']
          }
        ],
        limit: 20,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });

      console.log('✅ Includes funcionaram!');
      console.log(`   Total: ${resultFull.count}`);
    } catch (includeError) {
      console.log('⚠️  Includes falharam (pode ser associação):');
      console.log(`   ${includeError.message}\n`);
    }

    console.log('\n✅ Teste concluído com sucesso!');
    console.log('\n📋 Recomendações:');
    console.log('   1. Se total = 0: é normal! Crie um bloco primeiro');
    console.log('   2. Se erro de includes: verifica a associação em associations.js');
    console.log('   3. Se erro de query: verifica se disciplina está definida');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante teste:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testarEndpoint();
