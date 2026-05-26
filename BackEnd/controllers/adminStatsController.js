import Usuario from '../models/User.js';
import Torneio from '../models/Torneio.js';
import { Op } from 'sequelize';

export async function getStats(req, res) {
  console.log('[adminStatsController] getStats chamado');
  
  try {
    // Queries básicas apenas - sem Promise.all para evitar problemas
    const totalUsuarios = await Usuario.count();
    const totalAdmins = await Usuario.count({ where: { isAdmin: true } });
    const totalTorneios = await Torneio.count();
    const torneiosAtivos = await Torneio.count({ where: { status: 'ativo' } });
    
    console.log('[adminStatsController] Queries básicas OK:', { totalUsuarios, totalAdmins, totalTorneios, torneiosAtivos });

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
          finalizados: 0,
          inscricoesAtivas: 0
        },
        questoes: { total: 0, torneios: 0, testeConhecimento: 0 },
        testesConhecimento: { realizados30Dias: 0, mediaAcertos: 0 },
        evolucaoUsuarios: [],
        ultimasAtividades: { ultimosTestes: [], ultimosTorneios: [] }
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