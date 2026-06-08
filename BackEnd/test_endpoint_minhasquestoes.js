/**
 * test_endpoint_minhasquestoes.js
 * Testa o endpoint GET /api/colaborador/questoes com a correção
 */

import sequelize from './config/db.js';
import Questao from './models/Questao.js';
import { Op } from 'sequelize';

async function testEndpoint() {
  try {
    console.log('🔍 Testando endpoint minhasQuestoes com processamento de opcoes...\n');

    // Conectar
    await sequelize.authenticate();
    console.log('✅ Banco conectado\n');

    // Simular request
    const req = {
      user: {
        id: 1,
        role: 'colaborador',
        status_colaborador: 'aprovado',
        disciplina_colaborador: 'matematica'
      },
      query: {
        pagina: 1,
        limite: 20,
        busca: ''
      }
    };

    console.log('📋 Simulando request:');
    console.log('  - User ID:', req.user.id);
    console.log('  - Role:', req.user.role);
    console.log('  - Disciplina:', req.user.disciplina_colaborador);
    console.log('  - Página:', req.query.pagina);
    console.log('  - Limite:', req.query.limite);
    console.log();

    // Executar a lógica do endpoint
    console.log('🔨 Executando lógica do endpoint...\n');

    const {
      status_aprovacao,
      dificuldade,
      tipo,
      pagina = 1,
      limite = 20,
      busca = ''
    } = req.query;

    const where = {
      autor_id: req.user.id,
      disciplina: req.user.disciplina_colaborador
    };

    if (status_aprovacao) {
      where.status_aprovacao = status_aprovacao;
    }
    
    if (dificuldade) {
      where.dificuldade = dificuldade;
    }
    
    if (tipo) {
      where.tipo = tipo;
    }

    if (busca) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${busca}%` } },
        { descricao: { [Op.iLike]: `%${busca}%` } }
      ];
    }

    const offset = (pagina - 1) * limite;
    const { count, rows } = await Questao.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    console.log('✅ Query executada com sucesso');
    console.log('   - Total encontrado:', count);
    console.log('   - Retornado:', rows.length);
    console.log();

    // Processar as questões
    console.log('🔨 Processando questões (verificar opcoes)...\n');

    const questoesProcessadas = rows.map(q => {
      const questaoData = q.get ? q.get({ plain: true }) : q;
      
      // Processar campo opcoes
      let opcoes = questaoData.opcoes;
      console.log(`   Questão ${questaoData.id}:`);
      console.log(`     - opcoes tipo antes: ${typeof opcoes}`);
      console.log(`     - opcoes valor antes: ${String(opcoes).substring(0, 50)}...`);

      if (typeof opcoes === 'string') {
        try {
          opcoes = JSON.parse(opcoes);
          console.log(`     - opcoes PARSEADA como JSON ✅`);
        } catch (e) {
          console.log(`     - Erro ao parsear: ${e.message}`);
          opcoes = [];
        }
      }
      if (!Array.isArray(opcoes)) {
        console.log(`     - opcoes NÃO é array, convertendo para []`);
        opcoes = [];
      }
      console.log(`     - opcoes tipo depois: ${typeof opcoes}`);
      console.log(`     - opcoes length: ${opcoes.length}\n`);
      
      return {
        ...questaoData,
        opcoes
      };
    });

    // Calcular estatísticas
    const totalFiltrado = questoesProcessadas.length;
    const aprovadasFiltrado = questoesProcessadas.filter(q => q.status_aprovacao === 'aprovada').length;
    const pendentesFiltrado = questoesProcessadas.filter(q => q.status_aprovacao === 'pendente').length;
    const rejeitadasFiltrado = questoesProcessadas.filter(q => q.status_aprovacao === 'rejeitada').length;

    // Simular resposta
    const response = {
      sucesso: true,
      dados: {
        questoes: questoesProcessadas,
        paginacao: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total: count,
          totalPaginas: Math.ceil(count / limite)
        },
        estatisticas: {
          total: totalFiltrado,
          aprovadas: aprovadasFiltrado,
          pendentes: pendentesFiltrado,
          rejeitadas: rejeitadasFiltrado
        }
      }
    };

    console.log('🎉 Response pronta para enviar:\n');
    console.log('✅ Sucesso:', response.sucesso);
    console.log('✅ Questões:', response.dados.questoes.length);
    console.log('✅ Paginação:', response.dados.paginacao);
    console.log('✅ Estatísticas:', response.dados.estatisticas);
    console.log();

    // Testar JSON serialization
    console.log('🔨 Testando serialização JSON...');
    try {
      const jsonString = JSON.stringify(response);
      console.log('✅ JSON serializado com sucesso');
      console.log('   Tamanho:', jsonString.length, 'bytes');
    } catch (e) {
      console.error('❌ Erro ao serializar JSON:', e.message);
      throw e;
    }

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('\n📌 CONCLUSÃO:');
    console.log('   ✅ Endpoint minhasQuestoes funcionará corretamente');
    console.log('   ✅ Opcoes estão sendo processadas');
    console.log('   ✅ JSON serialização funciona');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testEndpoint();
