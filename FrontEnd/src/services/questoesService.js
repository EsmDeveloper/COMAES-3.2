/**
 * questoesService.js
 * ServiÃ§o para gerenciar questÃµes via API
 * 
 * IMPORTANTE: 
 * - Colaboradores usam /api/colaborador/questoes (com aprovaÃ§Ã£o workflow)
 * - Admins/PÃºblicos usam /api/questoes (genÃ©rico)
 */

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('comaes_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Determinar a rota baseado no tipo de usuÃ¡rio
 * Se for colaborador, usa /api/colaborador/questoes
 * SenÃ£o usa /api/questoes
 */
const getApiRoute = async () => {
  try {
    const token = localStorage.getItem('comaes_token');
    if (!token) return '/api/questoes';
    
    // Decodificar token para verificar role (simples, sem verificar signature)
    const base64Url = token.split('.')[1];
    if (!base64Url) return '/api/questoes';
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')));
    
    return decoded.role === 'colaborador' ? '/api/colaborador/questoes' : '/api/questoes';
  } catch (err) {
    return '/api/questoes';
  }
};

export const questoesService = {
  /**
   * Listar questÃµes do colaborador - endpoint especÃ­fico para colaboradores
   */
  async listarColaborador(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `${apiBaseUrl}/api/colaborador/questoes?${queryParams}`;
    
    try {
      console.log('ðŸ“¡ Iniciando requisiÃ§Ã£o:', { endpoint, apiBaseUrl });
      
      const res = await fetch(endpoint, {
        headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
      });
      
      const data = await res.json();
      
      console.log('ðŸ“¡ Resposta do servidor:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        conteudo: data
      });
      
      if (!res.ok) {
        console.error('âŒ Erro HTTP na resposta:', {
          status: res.status,
          statusText: res.statusText,
          dados_resposta: data,
          endpoint: endpoint,
          token_presente: !!localStorage.getItem('comaes_token')
        });
        
        // Tratamento especÃ­fico para diferentes status HTTP
        let mensagem = '';
        
        if (res.status === 401) {
          mensagem = 'SessÃ£o expirada. FaÃ§a login novamente.';
        } else if (res.status === 403) {
          mensagem = data?.mensagem || 'Acesso negado. VocÃª nÃ£o Ã© um colaborador aprovado.';
        } else if (res.status === 404) {
          mensagem = 'Endpoint nÃ£o encontrado. Verifique a configuraÃ§Ã£o da API.';
        } else if (res.status === 500) {
          mensagem = `Erro no servidor: ${data?.mensagem || 'Erro desconhecido'}`;
        } else {
          mensagem = data?.mensagem 
            || data?.message 
            || data?.erro 
            || data?.erros?.detalhes 
            || `HTTP ${res.status}: ${res.statusText}`;
        }
        
        const erro = new Error(mensagem);
        erro.statusCode = res.status;
        erro.responseData = data;
        throw erro;
      }
      
      console.log('âœ… QuestÃµes carregadas com sucesso:', {
        total_questoes: data?.dados?.questoes?.length || 0,
        endpoint: endpoint
      });
      return data;
    } catch (error) {
      // Se for erro de rede/conexÃ£o
      if (error instanceof TypeError) {
        if (error.message === 'Failed to fetch') {
          console.error('âŒ Erro de conexÃ£o (Failed to fetch):', {
            endpoint: endpoint,
            apiBaseUrl: apiBaseUrl,
            erro: error.message,
            dica: 'O servidor pode estar desligado ou o endereÃ§o estÃ¡ incorreto'
          });
          
          const erro = new Error(
            `Servidor nÃ£o estÃ¡ respondendo em ${apiBaseUrl}. ` +
            `Verifique se o servidor backend estÃ¡ rodando na porta 3000.`
          );
          erro.isNetworkError = true;
          throw erro;
        }
        
        console.error('âŒ Erro de tipo na requisiÃ§Ã£o:', {
          mensagem: error.message,
          stack: error.stack
        });
        throw new Error(`Erro ao processar resposta: ${error.message}`);
      }
      
      // Re-throw erros que jÃ¡ foram processados
      if (error.statusCode || error.isNetworkError) {
        throw error;
      }
      
      console.error('âŒ Erro inesperado:', {
        mensagem: error?.message,
        tipo: error?.name,
        stack: error?.stack
      });
      
      throw error;
    }
  },

  /**
   * Listar todas as questÃµes (jÃ¡ filtras por disciplina do colaborador no backend)
   */
  async listar(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const route = await getApiRoute();
    console.log('Usando rota:', route, 'com parÃ¢metros:', params);
    const res = await fetch(`${apiBaseUrl}${route}?${queryParams}`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Erro ao listar questÃµes com rota:', route, data);
      throw new Error(data.mensagem || data.message || 'Erro ao obter questÃµes');
    }
    return data;
  },

  /**
   * Obter uma questÃ£o pelo ID
   */
  async obter(id) {
    const route = await getApiRoute();
    const res = await fetch(`${apiBaseUrl}${route}/${id}`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao obter questÃ£o');
    return data;
  },

  /**
   * Criar uma nova questÃ£o
   */
  async criar(dados) {
    const route = await getApiRoute();
    console.log('Criando questÃ£o via rota:', route);
    const res = await fetch(`${apiBaseUrl}${route}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Erro ao criar questÃ£o:', data);
      throw new Error(data.mensagem || data.message || 'Erro ao criar questÃ£o');
    }
    return data;
  },

  /**
   * Atualizar uma questÃ£o existente
   */
  async atualizar(id, dados) {
    const route = await getApiRoute();
    console.log('Atualizando questÃ£o via rota:', route);
    const res = await fetch(`${apiBaseUrl}${route}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Erro ao atualizar questÃ£o:', data);
      throw new Error(data.mensagem || data.message || 'Erro ao atualizar questÃ£o');
    }
    return data;
  },

  /**
   * Deletar uma questÃ£o
   */
  async deletar(id) {
    const route = await getApiRoute();
    const res = await fetch(`${apiBaseUrl}${route}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao deletar questÃ£o');
    return data;
  },

  /**
 * Listar questÃµes por disciplina (para uso no filtro)
 */
  async listarPorDisciplina(disciplina) {
    return this.listar({ disciplina });
  },

  /**
   * Listar questÃµes pendentes de aprovaÃ§Ã£o (para admins)
   * Endpoint dedicated: /api/admin/questoes-colaborador-pendentes
   */
  async listarPendentes(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const res = await fetch(`${apiBaseUrl}/api/admin/questoes-colaborador-pendentes?${queryParams}`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao listar questÃµes pendentes');
    return data;
  },

  /**
   * Revisar questÃ£o (aprovar ou rejeitar)
   */
  async revisar(id, status_aprovacao, motivo_rejeicao = null) {
    const res = await fetch(`${apiBaseUrl}/api/questoes/${id}/aprovacao`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status_aprovacao, motivo_rejeicao }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao revisar questÃ£o');
    return data;
  },

  /**
   * Aprovar questÃ£o
   */
  async aprovar(id) {
    return this.revisar(id, 'aprovada', null);
  },

  /**
   * Rejeitar questÃ£o
   */
  async rejeitar(id, motivo_rejeicao) {
    return this.revisar(id, 'rejeitada', motivo_rejeicao);
  },

  /**
   * Submeter questÃ£o para aprovaÃ§Ã£o (apenas para colaboradores)
   * POST /api/colaborador/questoes/:id/submeter
   */
  async submeter(id) {
    const route = await getApiRoute();
    const res = await fetch(`${apiBaseUrl}${route}/${id}/submeter`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao submeter questÃ£o');
    return data;
  },

  /**
   * Adicionar questÃ£o a um bloco (apenas para colaboradores)
   * POST /api/colaborador/blocos/:blocoId/questoes
   */
  async adicionarAoBloco(blocoId, questaoId) {
    const res = await fetch(`${apiBaseUrl}/api/colaborador/blocos/${blocoId}/questoes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ questao_id: questaoId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao adicionar questÃ£o ao bloco');
    return data;
  },

  /**
   * Remover questÃ£o de um bloco (apenas para colaboradores)
   * DELETE /api/colaborador/blocos/:blocoId/questoes/:questaoId
   */
  async removerDoBloco(blocoId, questaoId) {
    const res = await fetch(`${apiBaseUrl}/api/colaborador/blocos/${blocoId}/questoes/${questaoId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao remover questÃ£o do bloco');
    return data;
  },
};

export default questoesService;
