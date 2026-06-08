/**
 * questoesService.js
 * Serviço para gerenciar questões via API
 * 
 * IMPORTANTE: 
 * - Colaboradores usam /api/colaborador/questoes (com aprovação workflow)
 * - Admins/Públicos usam /api/questoes (genérico)
 */

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('comaes_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Determinar a rota baseado no tipo de usuário
 * Se for colaborador, usa /api/colaborador/questoes
 * Senão usa /api/questoes
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
   * Listar questões do colaborador - endpoint específico para colaboradores
   */
  async listarColaborador(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `${apiBaseUrl}/api/colaborador/questoes?${queryParams}`;
    
    try {
      console.log('📡 Iniciando requisição:', { endpoint, apiBaseUrl });
      
      const res = await fetch(endpoint, {
        headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
      });
      
      const data = await res.json();
      
      console.log('📡 Resposta do servidor:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        conteudo: data
      });
      
      if (!res.ok) {
        console.error('❌ Erro HTTP na resposta:', {
          status: res.status,
          statusText: res.statusText,
          dados_resposta: data,
          endpoint: endpoint,
          token_presente: !!localStorage.getItem('comaes_token')
        });
        
        // Tratamento específico para diferentes status HTTP
        let mensagem = '';
        
        if (res.status === 401) {
          mensagem = 'Sessão expirada. Faça login novamente.';
        } else if (res.status === 403) {
          mensagem = data?.mensagem || 'Acesso negado. Você não é um colaborador aprovado.';
        } else if (res.status === 404) {
          mensagem = 'Endpoint não encontrado. Verifique a configuração da API.';
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
      
      console.log('✅ Questões carregadas com sucesso:', {
        total_questoes: data?.dados?.questoes?.length || 0,
        endpoint: endpoint
      });
      return data;
    } catch (error) {
      // Se for erro de rede/conexão
      if (error instanceof TypeError) {
        if (error.message === 'Failed to fetch') {
          console.error('❌ Erro de conexão (Failed to fetch):', {
            endpoint: endpoint,
            apiBaseUrl: apiBaseUrl,
            erro: error.message,
            dica: 'O servidor pode estar desligado ou o endereço está incorreto'
          });
          
          const erro = new Error(
            `Servidor não está respondendo em ${apiBaseUrl}. ` +
            `Verifique se o servidor backend está rodando na porta 3000.`
          );
          erro.isNetworkError = true;
          throw erro;
        }
        
        console.error('❌ Erro de tipo na requisição:', {
          mensagem: error.message,
          stack: error.stack
        });
        throw new Error(`Erro ao processar resposta: ${error.message}`);
      }
      
      // Re-throw erros que já foram processados
      if (error.statusCode || error.isNetworkError) {
        throw error;
      }
      
      console.error('❌ Erro inesperado:', {
        mensagem: error?.message,
        tipo: error?.name,
        stack: error?.stack
      });
      
      throw error;
    }
  },

  /**
   * Listar todas as questões (já filtras por disciplina do colaborador no backend)
   */
  async listar(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const route = await getApiRoute();
    console.log('Usando rota:', route, 'com parâmetros:', params);
    const res = await fetch(`${apiBaseUrl}${route}?${queryParams}`, {
      headers: { ...getAuthHeaders(), 'Accept': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Erro ao listar questões com rota:', route, data);
      throw new Error(data.mensagem || data.message || 'Erro ao obter questões');
    }
    return data;
  },

  /**
   * Obter uma questão pelo ID
   */
  async obter(id) {
    const route = await getApiRoute();
    const res = await fetch(`${apiBaseUrl}${route}/${id}`, {
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
    const route = await getApiRoute();
    console.log('Criando questão via rota:', route);
    const res = await fetch(`${apiBaseUrl}${route}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Erro ao criar questão:', data);
      throw new Error(data.mensagem || data.message || 'Erro ao criar questão');
    }
    return data;
  },

  /**
   * Atualizar uma questão existente
   */
  async atualizar(id, dados) {
    const route = await getApiRoute();
    console.log('Atualizando questão via rota:', route);
    const res = await fetch(`${apiBaseUrl}${route}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Erro ao atualizar questão:', data);
      throw new Error(data.mensagem || data.message || 'Erro ao atualizar questão');
    }
    return data;
  },

  /**
   * Deletar uma questão
   */
  async deletar(id) {
    const route = await getApiRoute();
    const res = await fetch(`${apiBaseUrl}${route}/${id}`, {
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
   * Listar questões pendentes de aprovação (para admins)
   * Endpoint dedicated: /api/admin/questoes-colaborador-pendentes
   */
  async listarPendentes(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const res = await fetch(`${apiBaseUrl}/api/admin/questoes-colaborador-pendentes?${queryParams}`, {
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

  /**
   * Submeter questão para aprovação (apenas para colaboradores)
   * POST /api/colaborador/questoes/:id/submeter
   */
  async submeter(id) {
    const route = await getApiRoute();
    const res = await fetch(`${apiBaseUrl}${route}/${id}/submeter`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao submeter questão');
    return data;
  },

  /**
   * Adicionar questão a um bloco (apenas para colaboradores)
   * POST /api/colaborador/blocos/:blocoId/questoes
   */
  async adicionarAoBloco(blocoId, questaoId) {
    const res = await fetch(`${apiBaseUrl}/api/colaborador/blocos/${blocoId}/questoes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ questao_id: questaoId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao adicionar questão ao bloco');
    return data;
  },

  /**
   * Remover questão de um bloco (apenas para colaboradores)
   * DELETE /api/colaborador/blocos/:blocoId/questoes/:questaoId
   */
  async removerDoBloco(blocoId, questaoId) {
    const res = await fetch(`${apiBaseUrl}/api/colaborador/blocos/${blocoId}/questoes/${questaoId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensagem || data.message || 'Erro ao remover questão do bloco');
    return data;
  },
};

export default questoesService;