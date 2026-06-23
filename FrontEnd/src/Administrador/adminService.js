/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMAES 3.2 - ADMIN SERVICE SEGURO
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * WHITELIST ESTRITA - sem proxy dinâmico, sem fallbacks
 * Corresponde exatamente ao backend modelMapperSecure.js
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002`}`;
const API_URL = `${API_BASE}/api/admin/`;

/**
 * WHITELIST ABSOLUTA de modelos administrativos
 * Deve corresponder exatamente ao backend
 */
const ALLOWED_ADMIN_MODELS = new Set([
  'usuario',
  'usuarios',
  'user',
  'users',
  'torneio',
  'torneios',
  'noticia',
  'noticias',
  'notificacao',
  'notificacoes',
  'questao',
  'questoes',
  'certificado',
  'certificados'
]);

const createApiClient = (token) => {
    return axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

const SPECIAL_ENDPOINTS = {
    torneio: 'torneos',
    user:    'users',
};

const createCrudClient = (modelName, token) => {
    const apiClient = createApiClient(token);
    const url = SPECIAL_ENDPOINTS[modelName] || modelName;

    return {
        getAll: () => apiClient.get(url).then(res => {
            if (res.data && res.data.success && Array.isArray(res.data.data)) {
                return res.data.data;
            }
            return res.data;
        }),
        getById: (id) => apiClient.get(`${url}/${id}`).then(res => res.data),
        create: (data) => {
            // Detectar se é FormData e ajustar headers automaticamente
            const isFormData = data instanceof FormData;
            const config = isFormData ? {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            } : {};
            return apiClient.post(url, data, config).then(res => res.data);
        },
        update: (id, data) => apiClient.put(`${url}/${id}`, data).then(res => res.data),
        delete: (id) => apiClient.delete(`${url}/${id}`).then(res => res.data)
    };
};

const adminService = (token) => {
    const apiClient = createApiClient(token);
    const serviceCache = {};

    /**
     * Obter serviço para um modelo COM VALIDAÇÃO DE WHITELIST
     */
    const getService = (modelName) => {
        if (!modelName) return null;
        
        const key = modelName.toLowerCase().trim();
        
        // ✅ VALIDAÇÃO DE WHITELIST
        if (!ALLOWED_ADMIN_MODELS.has(key)) {
            console.error(`[SECURITY] Tentativa de acesso a modelo não autorizado: "${modelName}"`);
            console.error(`[SECURITY] Modelos permitidos: ${Array.from(ALLOWED_ADMIN_MODELS).join(', ')}`);
            return null;
        }
        
        if (!serviceCache[key]) {
            serviceCache[key] = createCrudClient(key, token);
        }
        return serviceCache[key];
    };

    // Métodos específicos para gestão de colaboradores
    const colaboradorService = {
        listarColaboradoresPendentes: () => 
            apiClient.get('colaboradores-pendentes').then(res => res.data),
        
        listarColaboradores: () =>
            apiClient.get('colaboradores').then(res => res.data),
        
        getQuestoes: (colaboradorId, { status = '', tipo = '', dificuldade = '', pagina = 1, limite = 20 } = {}) => {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (tipo) params.append('tipo', tipo);
            if (dificuldade) params.append('dificuldade', dificuldade);
            params.append('pagina', pagina);
            params.append('limite', limite);
            
            const queryString = params.toString() ? `?${params.toString()}` : '';
            return apiClient.get(`colaboradores/${colaboradorId}/questoes${queryString}`).then(res => res.data);
        },
        
        aprovarColaborador: (id, disciplina = '') =>
            apiClient.patch(`users/${id}/aprovar-colaborador`, { disciplina_colaborador: disciplina }).then(res => res.data),
        
        rejeitarColaborador: (id, { motivo = '' } = {}) =>
            apiClient.patch(`users/${id}/rejeitar-colaborador`, { motivo }).then(res => res.data),

        suspenderColaborador: (id) =>
            apiClient.patch(`colaboradores/${id}/suspender`).then(res => res.data),

        getDocumentos: (id) =>
            apiClient.get(`colaboradores/${id}/documentos`).then(res => res.data),
    };

    // ✅ Criar serviços pré-inicializados para modelos comuns
    const usuarioService = createCrudClient('user', token);
    const notificacaoService = createCrudClient('notificacao', token);
    const torneoService = createCrudClient('torneio', token);
    const questaoService = createCrudClient('questao', token);
    const noticiaService = createCrudClient('noticia', token);
    const certificadoService = createCrudClient('certificado', token);
    
    const result = {
        getModels: () => apiClient.get('models').then(res => {
            const d = res.data;
            if (d && d.success && Array.isArray(d.data)) return d.data;
            if (Array.isArray(d)) return d;
            return [];
        }),
        getService,
        
        // ✅ Acesso direto aos serviços comuns (compatibilidade)
        user: usuarioService,
        users: usuarioService,
        usuario: usuarioService,
        usuarios: usuarioService,
        notificacao: notificacaoService,
        notificacoes: notificacaoService,
        torneio: torneoService,
        torneos: torneoService,
        questao: questaoService,
        questoes: questaoService,
        noticia: noticiaService,
        noticias: noticiaService,
        certificado: certificadoService,
        certificados: certificadoService,
        
        // Métodos específicos de colaboradores
        colaboradores: colaboradorService,
        listarColaboradoresPendentes: colaboradorService.listarColaboradoresPendentes,
        listarColaboradores: colaboradorService.listarColaboradores,
        getQuestoesColaborador: colaboradorService.getQuestoes,
        aprovarColaborador: colaboradorService.aprovarColaborador,
        rejeitarColaborador: colaboradorService.rejeitarColaborador,
        suspenderColaborador: colaboradorService.suspenderColaborador,
        getDocumentosColaborador: colaboradorService.getDocumentos,
    };
    
    return result;
};

export default adminService;
