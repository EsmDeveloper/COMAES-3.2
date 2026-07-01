/**
 * BlocosService.js
 * Serviço frontend para gestão de Blocos de Questões via API.
 * Substitui a persistÃªncia em localStorage do BlocoQuestoesManager anterior.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const headers = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || data.message || `Erro ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const BlocosService = {
  // â”€â”€ Blocos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** Lista todos os blocos com filtros opcionais */
  async listar(token, params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    const res = await fetch(`${API_BASE}/api/blocos${qs ? `?${qs}` : ''}`, {
      headers: headers(token),
    });
    return handleResponse(res);
  },

  /** Cria um novo bloco */
  async criar(token, dados) {
    const res = await fetch(`${API_BASE}/api/blocos`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(dados),
    });
    return handleResponse(res);
  },

  /** Obtém detalhe de um bloco com suas questões */
  async obter(token, id) {
    const res = await fetch(`${API_BASE}/api/blocos/${id}`, {
      headers: headers(token),
    });
    return handleResponse(res);
  },

  /** Edita um bloco existente */
  async editar(token, id, dados) {
    const res = await fetch(`${API_BASE}/api/blocos/${id}`, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(dados),
    });
    return handleResponse(res);
  },

  /** Deleta um bloco. Pode desassociar torneios quando confirmado explicitamente. */
  async deletar(token, id, options = {}) {
    const qs = options.desassociar ? '?desassociar=true' : '';
    const res = await fetch(`${API_BASE}/api/blocos/${id}${qs}`, {
      method: 'DELETE',
      headers: headers(token),
    });
    return handleResponse(res);
  },

  /** Adiciona uma questão a um bloco */
  async adicionarQuestao(token, blocoId, questaoId, ordem) {
    const res = await fetch(`${API_BASE}/api/blocos/${blocoId}/questoes`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ questao_id: questaoId, ordem }),
    });
    return handleResponse(res);
  },

  /** Remove uma questão de um bloco (não deleta a questão) */
  async removerQuestao(token, blocoId, questaoId) {
    const res = await fetch(`${API_BASE}/api/blocos/${blocoId}/questoes/${questaoId}`, {
      method: 'DELETE',
      headers: headers(token),
    });
    return handleResponse(res);
  },

  // â”€â”€ Torneio â†” Bloco â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** Lista blocos associados a um torneio */
  async listarBlocosDoTorneio(token, torneioId) {
    const res = await fetch(`${API_BASE}/api/torneios/${torneioId}/blocos`, {
      headers: headers(token),
    });
    return handleResponse(res);
  },

  /** Associa um bloco a um torneio */
  async associar(token, torneioId, blocoId, ordem) {
    const res = await fetch(`${API_BASE}/api/torneios/${torneioId}/blocos`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ bloco_id: blocoId, ordem }),
    });
    return handleResponse(res);
  },

  /** Desassocia um bloco de um torneio */
  async desassociar(token, torneioId, blocoId) {
    const res = await fetch(`${API_BASE}/api/torneios/${torneioId}/blocos/${blocoId}`, {
      method: 'DELETE',
      headers: headers(token),
    });
    return handleResponse(res);
  },
};

export default BlocosService;

