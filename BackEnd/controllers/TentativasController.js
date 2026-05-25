import TentativaResposta from '../models/TentativaResposta.js';
import Questao from '../models/Questao.js';
import ParticipanteTorneio from '../models/ParticipanteTorneio.js';
import User from '../models/User.js';
import Torneio from '../models/Torneio.js';

/**
 * Salvar uma tentativa de resposta
 * POST /api/tentativas
 * 
 * Body esperado:
 * {
 *   torneio_id: number,
 *   disciplina_competida: string (Matemática|Inglês|Programação),
 *   questao_id: number,
 *   resposta_selecionada: string,
 *   tempo_gasto: number (segundos, opcional)
 * }
 */
export const salvarTentativa = async (req, res) => {
  try {
    const { torneio_id, disciplina_competida, questao_id, resposta_selecionada, tempo_gasto } = req.body;
    const usuario_id = req.user.id;

    // ===== VALIDAÇÕES =====

    // 1. Validar que usuário está autenticado
    if (!usuario_id) {
      return res.status(401).json({ 
        sucesso: false, 
        erro: 'Usuário não autenticado' 
      });
    }

    // 2. Validar que usuário existe
    const usuario = await User.findByPk(usuario_id);
    if (!usuario) {
      return res.status(404).json({ 
        sucesso: false, 
        erro: 'Usuário não encontrado' 
      });
    }

    // 3. Validar que torneio existe
    const torneio = await Torneio.findByPk(torneio_id);
    if (!torneio) {
      return res.status(404).json({ 
        sucesso: false, 
        erro: 'Torneio não encontrado' 
      });
    }

    // 4. Validar que usuário está inscrito no torneio
    const participante = await ParticipanteTorneio.findOne({
      where: {
        usuario_id,
        torneio_id,
        disciplina_competida
      }
    });

    if (!participante) {
      return res.status(403).json({ 
        sucesso: false, 
        erro: 'Usuário não está inscrito neste torneio para esta disciplina' 
      });
    }

    // 5. Validar que participante está confirmado
    if (participante.status !== 'confirmado') {
      return res.status(403).json({ 
        sucesso: false, 
        erro: 'Participante não está confirmado no torneio' 
      });
    }

    // 6. Validar que questão existe
    const questao = await Questao.findByPk(questao_id);
    if (!questao) {
      return res.status(404).json({ 
        sucesso: false, 
        erro: 'Questão não encontrada' 
      });
    }

    // 7. Validar que disciplina_competida é válida
    const disciplinasValidas = ['Matemática', 'Inglês', 'Programação'];
    if (!disciplinasValidas.includes(disciplina_competida)) {
      return res.status(400).json({ 
        sucesso: false, 
        erro: 'Disciplina inválida' 
      });
    }

    // 8. Validar que resposta_selecionada foi fornecida
    if (!resposta_selecionada || resposta_selecionada.trim() === '') {
      return res.status(400).json({ 
        sucesso: false, 
        erro: 'Resposta não pode estar vazia' 
      });
    }

    // ===== PROCESSAMENTO =====

    // Buscar resposta correta da questão
    const respostaCorreta = questao.resposta_correta;

    // Comparar respostas (case-insensitive para letras)
    const respostaSelecionadaNormalizada = resposta_selecionada.trim().toLowerCase();
    const respostaCorretaNormalizada = respostaCorreta.trim().toLowerCase();
    const correta = respostaSelecionadaNormalizada === respostaCorretaNormalizada;

    // Calcular pontos obtidos
    const pontosObtidos = correta ? questao.pontos : 0;

    // ===== SALVAR =====

    const tentativa = await TentativaResposta.create({
      usuario_id,
      torneio_id,
      disciplina_competida,
      questao_id,
      resposta_selecionada,
      resposta_correta: respostaCorreta,
      correta,
      pontos_obtidos: pontosObtidos,
      tempo_gasto: tempo_gasto || null,
    });

    // ===== CALCULAR RESUMO =====

    // Buscar todas as tentativas do usuário neste torneio e disciplina
    const todasAsTentativas = await TentativaResposta.findAll({
      where: {
        usuario_id,
        torneio_id,
        disciplina_competida
      }
    });

    const totalAcertos = todasAsTentativas.filter(t => t.correta).length;
    const totalPontos = todasAsTentativas.reduce((sum, t) => sum + t.pontos_obtidos, 0);

    // ===== RESPOSTA =====

    return res.status(201).json({
      sucesso: true,
      tentativa: {
        id: tentativa.id,
        questao_id: tentativa.questao_id,
        correta: tentativa.correta,
        pontos_obtidos: tentativa.pontos_obtidos,
        resposta_correta: tentativa.resposta_correta,
        resposta_selecionada: tentativa.resposta_selecionada,
      },
      resumo: {
        total_acertos: totalAcertos,
        total_pontos: totalPontos,
        total_questoes: todasAsTentativas.length,
      }
    });

  } catch (erro) {
    console.error('Erro ao salvar tentativa:', erro);
    return res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro ao salvar tentativa' 
    });
  }
};

/**
 * Obter histórico de tentativas do usuário
 * GET /api/tentativas/:torneio_id/:disciplina
 */
export const obterHistorico = async (req, res) => {
  try {
    const { torneio_id, disciplina } = req.params;
    const usuario_id = req.user.id;

    const tentativas = await TentativaResposta.findAll({
      where: {
        usuario_id,
        torneio_id,
        disciplina_competida: disciplina
      },
      order: [['criado_em', 'DESC']],
      attributes: [
        'id',
        'questao_id',
        'resposta_selecionada',
        'resposta_correta',
        'correta',
        'pontos_obtidos',
        'tempo_gasto',
        'criado_em'
      ]
    });

    const totalAcertos = tentativas.filter(t => t.correta).length;
    const totalPontos = tentativas.reduce((sum, t) => sum + t.pontos_obtidos, 0);

    return res.status(200).json({
      sucesso: true,
      tentativas,
      resumo: {
        total_acertos: totalAcertos,
        total_pontos: totalPontos,
        total_questoes: tentativas.length,
      }
    });

  } catch (erro) {
    console.error('Erro ao obter histórico:', erro);
    return res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro ao obter histórico' 
    });
  }
};

/**
 * Obter estatísticas de tentativas para um torneio
 * GET /api/tentativas/stats/:torneio_id
 */
export const obterEstatisticas = async (req, res) => {
  try {
    const { torneio_id } = req.params;
    const usuario_id = req.user.id;

    const tentativas = await TentativaResposta.findAll({
      where: {
        usuario_id,
        torneio_id
      }
    });

    const estatisticas = {};

    // Agrupar por disciplina
    const disciplinas = ['Matemática', 'Inglês', 'Programação'];
    
    for (const disciplina of disciplinas) {
      const tentativasDisciplina = tentativas.filter(t => t.disciplina_competida === disciplina);
      
      if (tentativasDisciplina.length > 0) {
        const acertos = tentativasDisciplina.filter(t => t.correta).length;
        const pontos = tentativasDisciplina.reduce((sum, t) => sum + t.pontos_obtidos, 0);
        const tempoTotal = tentativasDisciplina.reduce((sum, t) => sum + (t.tempo_gasto || 0), 0);

        estatisticas[disciplina] = {
          total_questoes: tentativasDisciplina.length,
          total_acertos: acertos,
          taxa_acerto: ((acertos / tentativasDisciplina.length) * 100).toFixed(2) + '%',
          total_pontos: pontos,
          tempo_total_segundos: tempoTotal,
        };
      }
    }

    return res.status(200).json({
      sucesso: true,
      torneio_id,
      usuario_id,
      estatisticas
    });

  } catch (erro) {
    console.error('Erro ao obter estatísticas:', erro);
    return res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro ao obter estatísticas' 
    });
  }
};
