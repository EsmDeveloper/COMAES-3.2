/**
 * TournamentService.js
 * Serviço centralizado para operações de torneios
 * Responsabilidade única: Comunicação com API
 */

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;

export const TournamentService = {
  /**
   * Buscar todos os torneios
   */
  async fetchAll(token) {
    const res = await fetch(`${apiBaseUrl}/api/admin/torneos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) {
      throw new Error('Erro ao carregar torneios');
    }
    
    const data = await res.json();
    // Controller returns plain array; guard for wrapped responses too
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.tournaments)) return data.tournaments;
    return [];
  },

  /**
   * Buscar um torneio específico
   */
  async fetchById(id, token) {
    const res = await fetch(`${apiBaseUrl}/api/admin/torneos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) {
      throw new Error('Erro ao carregar torneio');
    }
    
    return res.json();
  },

  /**
   * Criar novo torneio
   */
  async create(payload, token) {
    const res = await fetch(`${apiBaseUrl}/api/admin/torneos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao criar torneio');
    }
    
    // Controller returns { message, torneio } — extract the torneio object
    return data.torneio || data;
  },

  /**
   * Atualizar torneio existente
   */
  async update(id, payload, token) {
    const res = await fetch(`${apiBaseUrl}/api/admin/torneos/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao atualizar torneio');
    }
    
    // Controller returns the torneio object directly on update
    return data.torneio || data;
  },

  /**
   * Deletar torneio
   */
  async delete(id, token) {
    const res = await fetch(`${apiBaseUrl}/api/admin/torneos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Aceitar 200-299 (sucesso) ou especificamente 204 (No Content)
    if (res.status < 200 || res.status >= 300) {
      if (res.status === 409) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Não é possível deletar este torneio');
      }
      
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao deletar torneio');
    }
    
    return true;
  }
};
