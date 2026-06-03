import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}`;
// Trailing slash required so relative paths (e.g. 'users') resolve to /api/admin/users
const API_URL = `${API_BASE}/api/admin/`;

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
    // No leading slash – must be relative to baseURL to avoid resolving to origin root
    const url = SPECIAL_ENDPOINTS[modelName] || modelName;

    return {
        getAll: () => apiClient.get(url).then(res => {
            // Se a resposta vier com { success: true, data: [...] } (padrão de alguns controllers)
            if (res.data && res.data.success && Array.isArray(res.data.data)) {
                return res.data.data;
            }
            // Se a resposta vier diretamente como array (padrão do UserController/GenericController)
            return res.data;
        }),
        getById: (id) => apiClient.get(`${url}/${id}`).then(res => res.data),
        create: (data) => apiClient.post(url, data).then(res => res.data),
        update: (id, data) => apiClient.put(`${url}/${id}`, data).then(res => res.data),
        delete: (id) => apiClient.delete(`${url}/${id}`).then(res => res.data)
    };
};

const adminService = (token) => {
    const apiClient = createApiClient(token);
    const serviceCache = {};

    const getService = (modelName) => {
        if (!modelName) return null;
        const key = modelName.toLowerCase().trim();
        if (!serviceCache[key]) {
            serviceCache[key] = createCrudClient(key, token);
        }
        return serviceCache[key];
    };

    // Métodos específicos para gestão de colaboradores
    const colaboradorService = {
        // Listar colaboradores pendentes
        listarColaboradoresPendentes: () => 
            apiClient.get('colaboradores-pendentes').then(res => res.data),
        
        // Listar todos os colaboradores
        listarColaboradores: () =>
            apiClient.get('colaboradores').then(res => res.data),
        
        // Aprovar colaborador
        aprovarColaborador: (id, disciplina = '') =>
            apiClient.patch(`users/${id}/aprovar-colaborador`, { disciplina_colaborador: disciplina }).then(res => res.data),
        
        // Rejeitar colaborador
        rejeitarColaborador: (id, { motivo = '' } = {}) =>
            apiClient.patch(`users/${id}/rejeitar-colaborador`, { motivo }).then(res => res.data)
    };

    // proxy allows accessing services via property access (e.g. svc.users)
    const serviceProxy = new Proxy({}, {
        get(_, prop) {
            if (prop === 'getModels' || prop === 'getService') return undefined;
            return getService(prop.toString());
        }
    });

    const result = {
        getModels: () => apiClient.get('models').then(res => {
            const d = res.data;
            if (d && d.success && Array.isArray(d.data)) return d.data;
            if (Array.isArray(d)) return d;
            return [];
        }),
        getService,
        // Adicionar service de colaboradores
        colaboradores: colaboradorService,
        // Métodos diretos (para compatibilidade)
        listarColaboradoresPendentes: colaboradorService.listarColaboradoresPendentes,
        listarColaboradores: colaboradorService.listarColaboradores,
        aprovarColaborador: colaboradorService.aprovarColaborador,
        rejeitarColaborador: colaboradorService.rejeitarColaborador
    };
    // copy proxy getters onto result so you can do adminService(token).users or adminService(token).torneio
    return new Proxy(result, {
        get(target, prop) {
            if (prop in target) return target[prop];
            const svc = serviceProxy[prop];
            if (svc !== undefined) return svc;
            return undefined;
        }
    });
};

export default adminService;