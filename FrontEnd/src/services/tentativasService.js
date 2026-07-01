/**
 * Serviço de Tentativas
 * Centraliza toda a comunicação com o backend para tentativas
 * O backend é responsável por:
 * - Validar resposta correta
 * - Calcular pontos
 * - Decidir se está correta
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Enviar uma tentativa de resposta para o backend
 * @param {Object} tentativa - Dados da tentativa
 * @param {number} tentativa.torneio_id - ID do torneio
 * @param {string} tentativa.disciplina_competida - Disciplina (Matemática|InglÃªs|Programação)
 * @param {number} tentativa.questao_id - ID da questão
 * @param {string} tentativa.resposta_selecionada - Resposta selecionada pelo usuário
 * @param {number} tentativa.tempo_gasto - Tempo gasto em segundos
 * @returns {Promise<Object>} Resposta do backend com validação e pontos
 */
export const enviarTentativa = async (tentativa) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token não encontrado. Usuário não autenticado.');
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
 * Obter histórico de tentativas do usuário
 * @param {number} torneio_id - ID do torneio
 * @param {string} disciplina - Disciplina (Matemática|InglÃªs|Programação)
 * @returns {Promise<Object>} Histórico de tentativas
 */
export const obterHistorico = async (torneio_id, disciplina) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token não encontrado. Usuário não autenticado.');
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
      throw new Error(result.erro || 'Erro ao obter histórico');
    }

    return result;
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    throw error;
  }
};

/**
 * Obter estatísticas de tentativas para um torneio
 * @param {number} torneio_id - ID do torneio
 * @returns {Promise<Object>} Estatísticas de tentativas
 */
export const obterEstatisticas = async (torneio_id) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token não encontrado. Usuário não autenticado.');
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
      throw new Error(result.erro || 'Erro ao obter estatísticas');
    }

    return result;
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    throw error;
  }
};

