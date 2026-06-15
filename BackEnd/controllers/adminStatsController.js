import Usuario from '../models/User.js';
import Torneio from '../models/Torneio.js';
import Questao from '../models/Questao.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import TentativaTeste from '../models/TentativaTeste.js';
import ResultadoTeste from '../models/ResultadoTeste.js';
import { Op, fn, col } from 'sequelize';

export async function getStats(req, res) {
  console.log('[adminStatsController] getStats chamado');

  try {
    // ========== USUÁRIOS ==========
    const totalUsuarios = await Usuario.count();
    const totalAdmins = await Usuario.count({ where: { isAdmin: true } });
    
    // Calcular novos usuários nos últimos 7, 30 e 90 dias
    const hoje = new Date();
    const dias7atras = new Date(hoje);
    dias7atras.setDate(dias7atras.getDate() - 7);
    const dias30atras = new Date(hoje);
    dias30atras.setDate(dias30atras.getDate() - 30);
    const dias90atras = new Date(hoje);
    dias90atras.setDate(dias90atras.getDate() - 90);
    
    const novos7dias = await Usuario.count({ where: { createdAt: { [Op.gte]: dias7atras } } });
    const novos30dias = await Usuario.count({ where: { createdAt: { [Op.gte]: dias30atras } } });
    const novos90dias = await Usuario.count({ where: { createdAt: { [Op.gte]: dias90atras } } });
    
    // Calcular variações
    const dias14atras = new Date(hoje);
    dias14atras.setDate(dias14atras.getDate() - 14);
    const novos7dias_anterior = await Usuario.count({ 
      where: { createdAt: { [Op.gte]: dias14atras, [Op.lt]: dias7atras } } 
    });
    const variacao7dias = novos7dias_anterior > 0 ? Math.round(((novos7dias - novos7dias_anterior) / novos7dias_anterior) * 100) : 0;
    
    const dias60atras = new Date(hoje);
    dias60atras.setDate(dias60atras.getDate() - 60);
    const novos30dias_anterior = await Usuario.count({ 
      where: { createdAt: { [Op.gte]: dias60atras, [Op.lt]: dias30atras } } 
    });
    const variacao30dias = novos30dias_anterior > 0 ? Math.round(((novos30dias - novos30dias_anterior) / novos30dias_anterior) * 100) : 0;

    // ========== TORNEIOS ==========
    const totalTorneios = await Torneio.count();
    const torneiosAtivos = await Torneio.count({ where: { status: 'ativo' } });
    const torneiosFinalizados = await Torneio.count({ where: { status: 'finalizado' } });
    
    // Contar inscrições ativas (participantes em torneios ativos)
    const inscricoesAtivas = await ParticipanteTorneio.count({
      include: [{
        model: Torneio,
        as: 'torneio',
        where: { status: 'ativo' },
        attributes: []
      }]
    });

    // ========== QUESTÕES ==========
    const totalQuestoes = await Questao.count();
    // Contar questões por tipo (torneios vs teste conhecimento) - simplificado
    const questoesTorneios = totalQuestoes; // Assumir que a maioria é para torneios
    const questoesTesteConhecimento = 0; // Modelo separado se existir

    // ========== TESTES DE CONHECIMENTO ==========
    const testes30dias = await ResultadoTeste.count({
      where: { created_at: { [Op.gte]: dias30atras } }
    });
    
    // Calcular média de acertos
    let mediaAcertos = 0;
    const resultadosTestes = await ResultadoTeste.findAll({
      where: { created_at: { [Op.gte]: dias30atras } },
      attributes: ['percentual_acertos'],
      raw: true
    });
    if (resultadosTestes.length > 0) {
      const somaAcertos = resultadosTestes.reduce((sum, r) => sum + (r.percentual_acertos || 0), 0);
      mediaAcertos = Math.round(somaAcertos / resultadosTestes.length);
    }

    // ========== EVOLUÇÃO DE USUÁRIOS (últimos 30 dias) ==========
    const evolucaoUsuarios = [];
    for (let i = 29; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      const proximaData = new Date(data);
      proximaData.setDate(proximaData.getDate() + 1);
      
      const usuariosAteData = await Usuario.count({
        where: { createdAt: { [Op.lt]: proximaData } }
      });
      
      evolucaoUsuarios.push({
        data: dataStr,
        usuarios: usuariosAteData
      });
    }

    // ========== ÚLTIMAS ATIVIDADES ==========
    // Últimos testes
    const ultimosTestes = await ResultadoTeste.findAll({
      attributes: ['id', 'percentual_acertos', 'created_at'],
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['nome'],
        required: true
      }],
      order: [['created_at', 'DESC']],
      limit: 5,
      raw: true
    }).then(testes => 
      testes.map(t => ({
        id: t.id,
        usuario: t['usuario.nome'],
        area: 'Geral',
        percentual: t.percentual_acertos,
        data: t.created_at
      }))
    );

    // Últimos torneios
    const ultimosTorneios = await Torneio.findAll({
      attributes: ['id', 'titulo', 'status', 'criado_em'],
      order: [['criado_em', 'DESC']],
      limit: 5,
      raw: true
    });

    console.log('[adminStatsController] Queries OK:', {
      totalUsuarios,
      totalAdmins,
      novos7dias,
      novos30dias,
      novos90dias,
      totalTorneios,
      torneiosAtivos,
      testes30dias
    });

    const responseData = {
      success: true,
      data: {
        usuarios: {
          total: totalUsuarios,
          administradores: totalAdmins,
          novos: { 
            dias7: novos7dias, 
            dias30: novos30dias, 
            dias90: novos90dias, 
            variacao7Dias: variacao7dias,
            variacao30Dias: variacao30dias
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
          torneios: questoesTorneios, 
          testeConhecimento: questoesTesteConhecimento 
        },
        testesConhecimento: { 
          realizados30Dias: testes30dias, 
          mediaAcertos: mediaAcertos 
        },
        evolucaoUsuarios: evolucaoUsuarios,
        ultimasAtividades: {
          ultimosTestes: ultimosTestes,
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