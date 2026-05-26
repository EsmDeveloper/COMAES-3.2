import Usuario from '../models/User.js';
import Torneio from '../models/Torneio.js';
import Questao from '../models/Questao.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import ResultadoTeste from '../models/ResultadoTeste.js';
import { Op } from 'sequelize';

export async function getStats(req, res) {
  console.log('[adminStatsController] Iniciando getStats...');
  
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    console.log('[adminStatsController] Datas calculadas:', {
      now: now.toISOString(),
      sevenDaysAgo: sevenDaysAgo.toISOString(),
      thirtyDaysAgo: thirtyDaysAgo.toISOString()
    });

    // Executar todas as consultas em paralelo
    const [
      totalUsuarios,
      totalAdmins,
      usuarios7Dias,
      usuarios30Dias,
      usuarios90Dias,
      totalTorneios,
      torneiosAtivos,
      torneiosFinalizados,
      totalQuestoes,
      questoesTorneio,
      questoesTesteConhecimento,
      resultados30Dias,
      mediaGeralAcertos,
      inscricoesAtivas,
      ultimosTestes,
      ultimosTorneios
    ] = await Promise.all([
      // Total de usuários
      Usuario.count().catch(err => {
        console.error('[adminStatsController] Erro ao contar usuarios:', err.message);
        return 0;
      }),
      // Total de administradores
      Usuario.count({ where: { isAdmin: true } }).catch(err => {
        console.error('[adminStatsController] Erro ao contar admins:', err.message);
        return 0;
      }),
      // Novos usuários nos últimos 7 dias
      Usuario.count({ where: { createdAt: { [Op.gt]: sevenDaysAgo } } }).catch(err => {
        console.error('[adminStatsController] Erro ao contar usuarios 7 dias:', err.message);
        return 0;
      }),
      // Novos usuários nos últimos 30 dias
      Usuario.count({ where: { createdAt: { [Op.gt]: thirtyDaysAgo } } }).catch(err => {
        console.error('[adminStatsController] Erro ao contar usuarios 30 dias:', err.message);
        return 0;
      }),
      // Novos usuários nos últimos 90 dias
      Usuario.count({ where: { createdAt: { [Op.gt]: ninetyDaysAgo } } }).catch(err => {
        console.error('[adminStatsController] Erro ao contar usuarios 90 dias:', err.message);
        return 0;
      }),
      // Total de torneios
      Torneio.count().catch(err => {
        console.error('[adminStatsController] Erro ao contar torneios:', err.message);
        return 0;
      }),
      // Torneios ativos
      Torneio.count({ where: { status: 'ativo' } }).catch(err => {
        console.error('[adminStatsController] Erro ao contar torneios ativos:', err.message);
        return 0;
      }),
      // Torneios finalizados
      Torneio.count({ where: { status: 'finalizado' } }).catch(err => {
        console.error('[adminStatsController] Erro ao contar torneios finalizados:', err.message);
        return 0;
      }),
      // Total de questões
      Questao.count().catch(err => {
        console.error('[adminStatsController] Erro ao contar questoes:', err.message);
        return 0;
      }),
      // Questões de torneios
      Questao.count({ where: { torneio_id: { [Op.ne]: null } } }).catch(err => {
        console.error('[adminStatsController] Erro ao contar questoes torneio:', err.message);
        return 0;
      }),
      // Questões de teste de conhecimento
      Questao.count({ where: { torneio_id: null } }).catch(err => {
        console.error('[adminStatsController] Erro ao contar questoes teste:', err.message);
        return 0;
      }),
      // Testes de conhecimento realizados nos últimos 30 dias
      ResultadoTeste.count({ where: { created_at: { [Op.gt]: thirtyDaysAgo } } }).catch(err => {
        console.error('[adminStatsController] Erro ao contar resultados 30 dias:', err.message);
        return 0;
      }),
      // Média geral de acertos
      ResultadoTeste.findAll({
        attributes: [
          [require('sequelize').fn('AVG', require('sequelize').col('percentual_acertos')), 'media']
        ],
        raw: true
      }).catch(err => {
        console.error('[adminStatsController] Erro ao calcular media:', err.message);
        return [{ media: 0 }];
      }),
      // Inscrições em torneios ativos
      ParticipanteTorneio.count({
        include: [{
          model: Torneio,
          as: 'torneio',
          where: { status: 'ativo' },
          required: true
        }]
      }).catch(err => {
        console.error('[adminStatsController] Erro ao contar inscricoes:', err.message);
        return 0;
      }),
      // Últimos 5 testes concluídos
      ResultadoTeste.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nome', 'email']
        }]
      }).catch(err => {
        console.error('[adminStatsController] Erro ao buscar ultimos testes:', err.message);
        return [];
      }),
      // Últimos 3 torneios criados
      Torneio.findAll({
        limit: 3,
        order: [['criado_em', 'DESC']],
        attributes: ['id', 'titulo', 'status', 'criado_em', 'inicia_em', 'termina_em']
      }).catch(err => {
        console.error('[adminStatsController] Erro ao buscar ultimos torneios:', err.message);
        return [];
      })
    ]);

    // Calcular variação percentual
    const variacao7Dias = usuarios7Dias > 0 ? Math.round((usuarios7Dias / (usuarios30Dias - usuarios7Dias || 1)) * 100) : 0;
    const variacao30Dias = usuarios30Dias > 0 ? Math.round((usuarios30Dias / (usuarios90Dias - usuarios30Dias || 1)) * 100) : 0;

    // Processar dados de evolução de usuários
    const evolucaoUsuarios = await gerarEvolucaoUsuarios(thirtyDaysAgo);

    const responseData = {
      success: true,
      data: {
        usuarios: {
          total: totalUsuarios,
          administradores: totalAdmins,
          novos: {
            dias7: usuarios7Dias,
            dias30: usuarios30Dias,
            dias90: usuarios90Dias,
            variacao7Dias: variacao7Dias,
            variacao30Dias: variacao30Dias
          }
        },
        torneios: {
          total: totalTorneios,
          ativos: torneiosAtivos,
          finalizados: torneiosFinalizados,
          inscricoesAtivas: inscricoesAtivas
        },
        questoes: {
          total: totalQuestoes,
          torneios: questoesTorneio,
          testeConhecimento: questoesTesteConhecimento
        },
        testesConhecimento: {
          realizados30Dias: resultados30Dias,
          mediaAcertos: mediaGeralAcertos[0]?.media ? Math.round(parseFloat(mediaGeralAcertos[0].media)) : 0
        },
        evolucaoUsuarios,
        ultimasAtividades: {
          ultimosTestes: ultimosTestes.map(t => ({
            id: t.id,
            usuario: t.usuario?.nome || 'Usuário desconhecido',
            area: t.area,
            percentual: t.percentual_acertos,
            pontos: t.pontos,
            data: t.created_at
          })),
          ultimosTorneios: ultimosTorneios.map(t => ({
            id: t.id,
            titulo: t.titulo,
            status: t.status,
            data: t.criado_em
          }))
        }
      }
    };

    console.log('[adminStatsController] Resposta preparada com sucesso');
    console.log('[adminStatsController] Resposta:', JSON.stringify(responseData).substring(0, 200) + '...');

    res.json(responseData);
  } catch (error) {
    console.error('[adminStatsController] ERRO FATAL:', error);
    console.error('[adminStatsController] Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao gerar estatísticas',
      message: error.message 
    });
  }
}

async function gerarEvolucaoUsuarios(sinceDate) {
  const dias = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

    try {
      const count = await Usuario.count({
        where: {
          createdAt: {
            [Op.gte]: date,
            [Op.lt]: nextDate
          }
        }
      });
      dias.push({
        data: date.toISOString().split('T')[0],
        usuarios: count
      });
    } catch (err) {
      console.error('[adminStatsController] Erro ao contar usuarios por dia:', err.message);
      dias.push({
        data: date.toISOString().split('T')[0],
        usuarios: 0
      });
    }
  }

  return dias;
}