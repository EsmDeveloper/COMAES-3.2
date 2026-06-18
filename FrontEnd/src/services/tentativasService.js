/**
 * ServiÃ§o de Tentativas
 * Centraliza toda a comunicaÃ§Ã£o com o backend para tentativas
 * O backend Ã© responsÃ¡vel por:
 * - Validar resposta correta
 * - Calcular pontos
 * - Decidir se estÃ¡ correta
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

/**
 * Enviar uma tentativa de resposta para o backend
 * @param {Object} tentativa - Dados da tentativa
 * @param {number} tentativa.torneio_id - ID do torneio
 * @param {string} tentativa.disciplina_competida - Disciplina (MatemÃ¡tica|InglÃªs|ProgramaÃ§Ã£o)
 * @param {number} tentativa.questao_id - ID da questÃ£o
 * @param {string} tentativa.resposta_selecionada - Resposta selecionada pelo usuÃ¡rio
 * @param {number} tentativa.tempo_gasto - Tempo gasto em segundos
 * @returns {Promise<Object>} Resposta do backend com validaÃ§Ã£o e pontos
 */
export const enviarTentativa = async (tentativa) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token nÃ£o encontrado. UsuÃ¡rio nÃ£o autenticado.');
    }

    const response = await fetch(`${API_BASE_URL}/api/tentativas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tentativa)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.erro || 'Erro ao enviar tentativa');
    }

    return result;
  } catch (error) {
    console.error('Erro ao enviar tentativa:', error);
    throw error;
  }
};

/**
 * Obter histÃ³rico de tentativas do usuÃ¡rio
 * @param {number} torneio_id - ID do torneio
 * @param {string} disciplina - Disciplina (MatemÃ¡tica|InglÃªs|ProgramaÃ§Ã£o)
 * @returns {Promise<Object>} HistÃ³rico de tentativas
 */
export const obterHistorico = async (torneio_id, disciplina) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token nÃ£o encontrado. UsuÃ¡rio nÃ£o autenticado.');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/tentativas/${torneio_id}/${disciplina}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.erro || 'Erro ao obter histÃ³rico');
    }

    return result;
  } catch (error) {
    console.error('Erro ao obter histÃ³rico:', error);
    throw error;
  }
};

/**
 * Obter estatÃ­sticas de tentativas para um torneio
 * @param {number} torneio_id - ID do torneio
 * @returns {Promise<Object>} EstatÃ­sticas de tentativas
 */
export const obterEstatisticas = async (torneio_id) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token nÃ£o encontrado. UsuÃ¡rio nÃ£o autenticado.');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/tentativas/stats/${torneio_id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.erro || 'Erro ao obter estatÃ­sticas');
    }

    return result;
  } catch (error) {
    console.error('Erro ao obter estatÃ­sticas:', error);
    throw error;
  }
};

