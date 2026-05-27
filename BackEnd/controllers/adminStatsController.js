import Usuario from '../models/User.js';
import Torneio from '../models/Torneio.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import ResultadoTeste from '../models/ResultadoTeste.js';
import { Op, fn, col, literal } from 'sequelize';

export async function getStats(req, res) {
  console.log('[adminStatsController] getStats chamado');

  try {
    // Queries básicas
    const totalUsuarios = await Usuario.count();
    const totalAdmins = await Usuario.count({ where: { isAdmin: true } });
    const totalTorneios = await Torneio.count();
    const torneiosAtivos = await Torneio.count({ where: { status: 'ativo' } });
    const torneiosFinalizados = await Torneio.count({ where: { status: 'finalizado' } });

    // Contagem de inscrições ativas
    const inscricoesAtivas = await ParticipanteTorneio.count({
      where: { status: 'confirmado' }
    });

    // Buscar últimos testes concluídos
    const ultimosTestes = await ResultadoTeste.findAll({
      attributes: [
        'id',
        'percentual_acertos',
        'area',
        'created_at'
      ],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nome']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5,
      raw: false
    });

    // Formatar últimos testes para o frontend
    const ultimosTestesFormatados = ultimosTestes.map(teste => {
      const u = teste.usuario || teste.Usuario;
      return {
        id: teste.id,
        usuario: u?.nome || 'Usuário',
        area: teste.area || 'conhecimento',
        percentual: teste.percentual_acertos,
        pontos: Math.round(teste.percentual_acertos * 10), // Exemplo: 80% = 800 pts
        data: teste.created_at
      };
    });

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
      inscricoesAtivas,
      ultimosTestes: ultimosTestesFormatados.length,
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
          inscricoesAtivas: inscricoesAtivas
        },
        questoes: { total: 0, torneios: 0, testeConhecimento: 0 },
        testesConhecimento: { realizados30Dias: 0, mediaAcertos: 0 },
        evolucaoUsuarios: [],
        ultimasAtividades: {
          ultimosTestes: ultimosTestesFormatados,
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

    // Calcular data de início
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);
    dataInicio.setHours(0, 0, 0, 0);

    // Usar DATE(createdAt) para agrupar por dia (createdAt é o nome da coluna no modelo Usuario)
    const usuarios = await Usuario.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'data'],
        [fn('COUNT', col('id')), 'quantidade']
      ],
      where: {
        createdAt: {
          [Op.gte]: dataInicio
        }
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    });

    console.log(`[adminStatsController] Usuários encontrados por dia:`, usuarios.length);

    // Gerar array completo com todas as datas (preencher zeros para dias sem registros)
    const resultado = [];
    const hoje = new Date();

    for (let i = 0; i < dias; i++) {
      const data = new Date(dataInicio);
      data.setDate(data.getDate() + i);
      const dataStr = data.toISOString().split('T')[0];

      const registro = usuarios.find(u => {
        // Ajustar para o formato de data do MySQL
        const dataMySQL = new Date(u.data).toISOString().split('T')[0];
        return dataMySQL === dataStr;
      });

      resultado.push({
        data: dataStr,
        quantidade: registro ? parseInt(registro.quantidade) : 0
      });
    }

    console.log(`[adminStatsController] getUsuariosPorDia: ${resultado.length} dias gerados`);

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

    const atividades = [];

    // 1. Últimas inscrições em torneios (apenas confirmados)
    const inscricoes = await ParticipanteTorneio.findAll({
      attributes: [
        'id',
        'entrou_em',
        'disciplina_competida'
      ],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nome']
        },
        {
          model: Torneio,
          as: 'torneio',
          attributes: ['titulo']
        }
      ],
      where: {
        status: 'confirmado'
      },
      order: [['entrou_em', 'DESC']],
      limit: Math.ceil(limite / 3),
      raw: false
    });

    console.log(`[adminStatsController] Inscrições encontradas: ${inscricoes.length}`);

    inscricoes.forEach(insc => {
      const u = insc.usuario || insc.Usuario;
      const t = insc.torneio || insc.Torneio;
      atividades.push({
        usuario_nome: u?.nome || 'Usuário',
        acao: 'inscricao_torneio',
        detalhe: `Inscrito em "${t?.titulo || 'desconhecido'}" (${insc.disciplina_competida})`,
        data_hora: insc.entrou_em
      });
    });

    // 2. Últimos testes de conhecimento concluídos
    if (ResultadoTeste) {
      const resultados = await ResultadoTeste.findAll({
        attributes: [
          'id',
          'created_at',
          'percentual_acertos',
          'area'
        ],
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nome']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: Math.ceil(limite / 3),
        raw: false
      });

      console.log(`[adminStatsController] Resultados de teste encontrados: ${resultados.length}`);

      resultados.forEach(res => {
        const u = res.usuario || res.Usuario;
        atividades.push({
          usuario_nome: u?.nome || 'Usuário',
          acao: 'completar_teste',
          detalhe: `Teste de ${res.area || 'conhecimento'} - ${res.percentual_acertos}% acertos`,
          data_hora: res.created_at
        });
      });
    }

    // 3. Últimos torneios finalizados
    const torneiosFinalizados = await Torneio.findAll({
      attributes: ['id', 'status', 'titulo', 'criado_em'],
      where: { status: 'finalizado' },
      order: [['criado_em', 'DESC']],
      limit: Math.ceil(limite / 3),
      raw: true
    });

    console.log(`[adminStatsController] Torneios finalizados encontrados: ${torneiosFinalizados.length}`);

    torneiosFinalizados.forEach(t => {
      atividades.push({
        usuario_nome: 'Sistema',
        acao: 'finalizar_torneio',
        detalhe: `Torneio "${t.titulo}" foi finalizado`,
        data_hora: t.criado_em
      });
    });

    // Ordenar por data e limitar
    atividades.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
    const resultado = atividades.slice(0, limite);

    console.log(`[adminStatsController] getAtividadesRecentes: ${resultado.length} atividades retornadas`);

    res.json({
      success: true,
      limite,
      dados: resultado
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

export default {
  getStats,
  getUsuariosPorDia,
  getAtividadesRecentes
};