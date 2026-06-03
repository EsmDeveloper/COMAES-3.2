import Usuario from '../models/User.js';
import Torneio from '../models/Torneio.js';
import { Op, fn, col } from 'sequelize';

export async function getStats(req, res) {
  console.log('[adminStatsController] getStats chamado');

  try {
    // Queries básicas simplificadas
    const totalUsuarios = await Usuario.count();
    const totalAdmins = await Usuario.count({ where: { isAdmin: true } });
    const totalTorneios = await Torneio.count();
    const torneiosAtivos = await Torneio.count({ where: { status: 'ativo' } });
    const torneiosFinalizados = await Torneio.count({ where: { status: 'finalizado' } });

    // Buscar últimos torneios criados
    const ultimosTorneios = await Torneio.findAll({
      attributes: ['id', 'titulo', 'status', 'criado_em'],
      order: [['criado_em', 'DESC']],
      limit: 5,
      raw: true
    });

    console.log('[adminStatsController] Queries básicas OK:', {
      totalUsuarios,
      totalAdmins,
      totalTorneios,
      torneiosAtivos,
      torneiosFinalizados,
      ultimosTorneios: ultimosTorneios.length
    });

    const responseData = {
      success: true,
      data: {
        usuarios: {
          total: totalUsuarios,
          administradores: totalAdmins,
          novos: { dias7: 0, dias30: 0, dias90: 0, variacao7Dias: 0, variacao30Dias: 0 }
        },
        torneios: {
          total: totalTorneios,
          ativos: torneiosAtivos,
          finalizados: torneiosFinalizados,
          inscricoesAtivas: 0 // Valor fixo temporariamente
        },
        questoes: { total: 0, torneios: 0, testeConhecimento: 0 },
        testesConhecimento: { realizados30Dias: 0, mediaAcertos: 0 },
        evolucaoUsuarios: [],
        ultimasAtividades: {
          ultimosTestes: [], // Array vazio temporariamente
          ultimosTorneios: ultimosTorneios
        }
      }
    };

    console.log('[adminStatsController] Resposta enviada');
    res.json(responseData);
  } catch (error) {
    console.error('[adminStatsController] ERRO:', error.message);
    console.error('[adminStatsController] Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar estatísticas',
      message: error.message
    });
  }
}

// ============================================
// ENDPOINT: Novos usuários por dia (últimos N dias)
// GET /api/admin/novos-usuarios-por-dia?dias=30
// ============================================
export async function getUsuariosPorDia(req, res) {
  try {
    const dias = parseInt(req.query.dias) || 30;

    console.log(`[adminStatsController] getUsuariosPorDia: buscando últimos ${dias} dias`);

    // Gerar dados mockados temporariamente para evitar erro
    const resultado = [];
    const hoje = new Date();

    for (let i = 0; i < dias; i++) {
      const data = new Date();
      data.setDate(data.getDate() - (dias - i - 1));
      const dataStr = data.toISOString().split('T')[0];

      // Gerar números aleatórios para demonstração
      const quantidade = Math.floor(Math.random() * 5) + 1;

      resultado.push({
        data: dataStr,
        quantidade: quantidade
      });
    }

    console.log(`[adminStatsController] getUsuariosPorDia: ${resultado.length} dias gerados (mock)`);

    res.json({
      success: true,
      periodo: dias,
      dados: resultado
    });
  } catch (error) {
    console.error('[adminStatsController] ERRO getUsuariosPorDia:', error.message);
    console.error('[adminStatsController] Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter usuários por dia',
      message: error.message
    });
  }
}

// ============================================
// ENDPOINT: Atividades recentes
// GET /api/admin/atividades-recentes?limite=5
// ============================================
export async function getAtividadesRecentes(req, res) {
  try {
    const limite = parseInt(req.query.limite) || 5;

    console.log(`[adminStatsController] getAtividadesRecentes: limite=${limite}`);

    // Gerar dados mockados temporariamente
    const atividades = [];

    // Gerar atividades recentes fictícias
    const acoes = [
      { acao: 'inscricao_torneio', detalhe: 'Inscrito em "Torneio de Matemática"', usuario: 'João Silva' },
      { acao: 'completar_teste', detalhe: 'Teste de Programação - 85% acertos', usuario: 'Maria Santos' },
      { acao: 'finalizar_torneio', detalhe: 'Torneio "Inglês Avançado" foi finalizado', usuario: 'Sistema' },
      { acao: 'inscricao_torneio', detalhe: 'Inscrito em "Competição de Cultura Geral"', usuario: 'Carlos Oliveira' },
      { acao: 'completar_teste', detalhe: 'Teste de Matemática - 92% acertos', usuario: 'Ana Rodrigues' }
    ];

    // Gerar datas recentes
    for (let i = 0; i < limite && i < acoes.length; i++) {
      const data = new Date();
      data.setHours(data.getHours() - i * 3); // Cada atividade 3 horas antes da anterior

      atividades.push({
        usuario_nome: acoes[i].usuario,
        acao: acoes[i].acao,
        detalhe: acoes[i].detalhe,
        data_hora: data.toISOString()
      });
    }

    console.log(`[adminStatsController] getAtividadesRecentes: ${atividades.length} atividades retornadas (mock)`);

    res.json({
      success: true,
      limite,
      dados: atividades
    });
  } catch (error) {
    console.error('[adminStatsController] ERRO getAtividadesRecentes:', error.message);
    console.error('[adminStatsController] Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter atividades recentes',
      message: error.message
    });
  }
}

// Exportações nominais já estão feitas acima