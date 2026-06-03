/**
 * questoesService.js
 * Serviço para gerenciar questões via API
 */

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('comaes_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const questoesService = {
  /**
   * Listar todas as questões (já filtras por disciplina do colaborador no backend)
   */
  async listar(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const res = await fetch(`${apiBaseUrl}/api/questoes?${queryParams}`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao listar questões');
    return data;
  },

  /**
   * Obter uma questão pelo ID
   */
  async obter(id) {
    const res = await fetch(`${apiBaseUrl}/api/questoes/${id}`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao obter questão');
    return data;
  },

  /**
   * Criar uma nova questão
   */
  async criar(dados) {
    const res = await fetch(`${apiBaseUrl}/api/questoes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao criar questão');
    return data;
  },

  /**
   * Atualizar uma questão existente
   */
  async atualizar(id, dados) {
    const res = await fetch(`${apiBaseUrl}/api/questoes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao atualizar questão');
    return data;
  },

  /**
   * Deletar uma questão
   */
  async deletar(id) {
    const res = await fetch(`${apiBaseUrl}/api/questoes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao deletar questão');
    return data;
  },

  /**
 * Listar questões por disciplina (para uso no filtro)
 */
  async listarPorDisciplina(disciplina) {
    return this.listar({ disciplina });
  },

  /**
   * Listar questões pendentes de aprovação
   */
  async listarPendentes(params = {}) {
    const queryParams = new URLSearchParams({ ...params, status_aprovacao: 'pendente' }).toString();
    const res = await fetch(`${apiBaseUrl}/api/questoes?${queryParams}`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao listar questões pendentes');
    return data;
  },

  /**
   * Revisar questão (aprovar ou rejeitar)
   */
  async revisar(id, status_aprovacao, motivo_rejeicao = null) {
    const res = await fetch(`${apiBaseUrl}/api/questoes/${id}/aprovacao`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status_aprovacao, motivo_rejeicao }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao revisar questão');
    return data;
  },

  /**
   * Aprovar questão
   */
  async aprovar(id) {
    return this.revisar(id, 'aprovada', null);
  },

  /**
   * Rejeitar questão
   */
  async rejeitar(id, motivo_rejeicao) {
    return this.revisar(id, 'rejeitada', motivo_rejeicao);
  },
};

export default questoesService;