/**
 * TournamentService.js
 * Serviço centralizado para operaçÃµes de torneios
 * Responsabilidade Ãºnica: Comunicação com API
 */

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

export const TournamentService = {
  /**
   * Buscar todos os torneios
   */
  async fetchAll(token) {
    console.log('[TournamentService] Fetching all torneios...');
    const res = await fetch(`${apiBaseUrl}/api/admin/torneos`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('[TournamentService] Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[TournamentService] Error response:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || `Erro ${res.status}: ${res.statusText}`);
      } catch {
        throw new Error(`Erro ${res.status}: ${res.statusText}`);
      }
    }
    
    const data = await res.json();
    console.log('[TournamentService] Data received:', Array.isArray(data) ? `${data.length} torneios` : data);
    
    // Controller returns plain array; guard for wrapped responses too
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.tournaments)) return data.tournaments;
    if (data.success && Array.isArray(data.dados)) return data.dados;
    
    console.warn('[TournamentService] Unexpected response format:', data);
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
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao carregar torneio');
    }
    
    return res.json();
  },

  /**
   * Criar novo torneio
   */
  async create(payload, token) {
    console.log('[TournamentService] Creating tournament with payload:', payload);
    
    const res = await fetch(`${apiBaseUrl}/api/admin/torneos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('[TournamentService] Create response status:', res.status);
    
    const data = await res.json();
    console.log('[TournamentService] Create response:', data);
    
    if (!res.ok) {
      // âœ… Preservar tipo de erro (ex: TOURNAMENT_CONFLICT) na mensagem
      const errorMsg = data.error ? `${data.message} (${data.error})` : (data.message || 'Erro ao criar torneio');
      throw new Error(errorMsg);
    }
    
    // Controller returns { message, torneio } â€” extract the torneio object
    return data.torneio || data;
  },

  /**
   * Atualizar torneio existente
   */
  async update(id, payload, token) {
    console.log('[TournamentService] Updating tournament:', id, payload);
    
    const res = await fetch(`${apiBaseUrl}/api/admin/torneos/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      // âœ… Preservar tipo de erro na mensagem
      const errorMsg = data.error ? `${data.message} (${data.error})` : (data.message || 'Erro ao atualizar torneio');
      throw new Error(errorMsg);
    }
    
    // Controller returns the torneio object directly on update
    return data.torneio || data;
  },

  /**
   * Deletar torneio
   */
  async delete(id, token) {
    console.log('[TournamentService] Deleting tournament:', id);
    
    const res = await fetch(`${apiBaseUrl}/api/admin/torneos/${id}`, {
      method: 'DELETE',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
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
