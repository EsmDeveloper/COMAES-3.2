/**
 * gamificacaoService.js - ServiÃ§o para endpoints de gamificaÃ§Ã£o
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('comaes_token')}`,
  'Content-Type': 'application/json'
});

/**
 * Busca os dados agregados de gamificaÃ§Ã£o para o usuÃ¡rio autenticado
 * @returns {Promise} Promise com os dados de gamificaÃ§Ã£o
 */
export const fetchDashboardGamificacao = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/usuarios/me/dashboard-gamificacao`,
      {
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Erro ao carregar dados de gamificaÃ§Ã£o');
    }

    return data.data;
  } catch (error) {
    console.error('Erro no serviÃ§o de gamificaÃ§Ã£o:', error);
    throw error;
  }
};

/**
 * Busca o nÃ­vel atual do usuÃ¡rio
 * @returns {Promise} Promise com dados do nÃ­vel
 */
export const fetchNivelAtual = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/usuarios/me/nivel`,
      {
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Erro ao buscar nÃ­vel:', error);
    return null;
  }
};

/**
 * Busca a sequÃªncia de aprendizagem (streak) do usuÃ¡rio
 * @returns {Promise} Promise com dados do streak
 */
export const fetchStreak = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/streak/me`,
      {
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Erro ao buscar streak:', error);
    return null;
  }
};

/**
 * Busca as conquistas recentes do usuÃ¡rio
 * @param {number} limit - Limite de conquistas (padrÃ£o: 5)
 * @returns {Promise} Promise com lista de conquistas
 */
export const fetchConquistasRecentes = async (limit = 5) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/conquistas/recentes?limit=${limit}`,
      {
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    return [];
  }
};

/**
 * Busca as posiÃ§Ãµes do usuÃ¡rio nos rankings
 * @returns {Promise} Promise com dados de ranking
 */
export const fetchRankings = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/ranking/posicao`,
      {
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ? data.data : { global: null, categorias: [] };
  } catch (error) {
    console.error('Erro ao buscar rankings:', error);
    return { global: null, categorias: [] };
  }
};

/**
 * Busca as missÃµes ativas do usuÃ¡rio
 * @param {number} limit - Limite de missÃµes (padrÃ£o: 3)
 * @returns {Promise} Promise com lista de missÃµes
 */
export const fetchMissoesAtivas = async (limit = 3) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/missoes/ativas?limit=${limit}`,
      {
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Erro ao buscar missÃµes:', error);
    return [];
  }
};

/**
 * Busca a evoluÃ§Ã£o de XP do usuÃ¡rio (Ãºltimos 30 dias)
 * @returns {Promise} Promise com dados de evoluÃ§Ã£o de XP
 */
export const fetchEvolucaoXP = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/usuarios/me/evolucao-xp`,
      {
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Erro ao buscar evoluÃ§Ã£o de XP:', error);
    return [];
  }
};

/**
 * Atualiza todas as funÃ§Ãµes para usar o novo endpoint agregado
 */
export default {
  fetchDashboardGamificacao,
  fetchNivelAtual,
  fetchStreak,
  fetchConquistasRecentes,
  fetchRankings,
  fetchMissoesAtivas,
  fetchEvolucaoXP
};
