/**
 * colaboradorService.js
 * Serviço para acessar endpoints específicos de colaboradores
 * 
 * Decisão de reutilização:
 * - CRUD de questÃµes (criar/editar/deletar/listar) â†’ questoesService (/api/questoes)
 *   O endpoint /api/questoes já filtra automaticamente por colaborador via aplicarEscopoColaborador()
 * - Estatísticas detalhadas â†’ /api/colaborador/estatisticas (dados específicos: porTipo, mediaPontos, etc.)
 * - Perfil â†’ /api/colaborador/perfil
 */

import questoesService from './questoesService.js';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('comaes_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const colaboradorService = {
  /**
   * Obter estatísticas do colaborador
   * Usa /api/colaborador/estatisticas que retorna dados detalhados:
   * porTipo, mediaPontos, taxaRejeicao, ultimasQuestoes, perfil
   */
  async obterEstatisticas() {
    const res = await fetch(`${apiBaseUrl}/api/colaborador/estatisticas`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao obter estatísticas');
    return data;
  },

  /**
   * Obter questÃµes do colaborador com filtros
   * REUTILIZA questoesService.listar() â€” /api/questoes já filtra por colaborador automaticamente
   * via aplicarEscopoColaborador() no backend
   */
  async obterMinhasQuestoes(params = {}) {
    // Reutiliza o endpoint genérico que já aplica o escopo do colaborador
    return questoesService.listar(params);
  },

  /**
   * Obter perfil do colaborador
   */
  async obterPerfil() {
    const res = await fetch(`${apiBaseUrl}/api/colaborador/perfil`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao obter perfil');
    return data;
  },

  /**
   * Obter estatísticas resumidas (método auxiliar)
   */
  async obterEstatisticasResumidas() {
    try {
      const stats = await this.obterEstatisticas();
      return {
        total: stats.dados?.total || 0,
        aprovadas: stats.dados?.aprovadas || 0,
        pendentes: stats.dados?.pendentes || 0,
        rejeitadas: stats.dados?.rejeitadas || 0,
        porDificuldade: stats.dados?.porDificuldade || { facil: 0, medio: 0, dificil: 0 },
        taxaAprovacao: stats.dados?.taxaAprovacao || 0,
        ultimasQuestoes: stats.dados?.ultimasQuestoes || [],
        perfil: stats.dados?.perfil || {}
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas resumidas:', error);
      return {
        total: 0,
        aprovadas: 0,
        pendentes: 0,
        rejeitadas: 0,
        porDificuldade: { facil: 0, medio: 0, dificil: 0 },
        taxaAprovacao: 0,
        ultimasQuestoes: [],
        perfil: {}
      };
    }
  },

  /**
   * Obter questÃµes filtradas por status
   * REUTILIZA questoesService.listar() com filtro de status
   */
  async obterQuestoesPorStatus(status) {
    const params = {};
    if (status && status !== 'todas') {
      params.status_aprovacao = status;
    }
    // Reutiliza o endpoint genérico
    return questoesService.listar(params);
  }
};

export default colaboradorService;
