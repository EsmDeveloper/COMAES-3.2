import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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

const createCrudClient = (modelName, token) => {
    const apiClient = createApiClient(token);
    // No leading slash – must be relative to baseURL to avoid resolving to origin root
    const url = modelName;

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

    return {
        getModels: () => apiClient.get('models').then(res => res.data),
        getService
    };
};

export default adminService;
