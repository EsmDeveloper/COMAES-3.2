/**
 * 🛡️ SAFE API CLIENT - Enterprise Grade
 * 
 * Cliente HTTP com validação automática e normalização de respostas.
 * Todas as chamadas são interceptadas e sanitizadas antes de chegarem aos componentes.
 * 
 * @module safeApi
 * @version 2.0.0
 */

import { 
  normalizeApiResponse, 
  extractArrayFromResponse,
  safeGet,
  categorizeError 
} from './dataSafety';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                     import.meta.env.VITE_API_URL || 
                     `http://${window.location.hostname}:3002`;

const DEFAULT_TIMEOUT = 30000; // 30 segundos
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 segundo

/* ============================================================================
   ERROR CLASSES
   ============================================================================ */

export class ApiError extends Error {
  constructor(message, statusCode = null, originalError = null, response = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.response = response;
    this.category = categorizeError(originalError || this);
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Erro de conexão. Verifique sua internet.', originalError = null) {
    super(message, null, originalError);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message = 'Tempo limite excedido. Tente novamente.', originalError = null) {
    super(message, 408, originalError);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Dados inválidos.', errors = {}) {
    super(message, 422);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/* ============================================================================
   REQUEST UTILITIES
   ============================================================================ */

/**
 * Adiciona timeout a uma Promise
 */
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new TimeoutError()), ms)
    ),
  ]);
};

/**
 * Sleep utility para retry
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determina se deve fazer retry baseado no erro
 */
const shouldRetry = (error, attempt) => {
  if (attempt >= MAX_RETRIES) return false;
  
  // Retry em erros de rede
  if (error instanceof NetworkError) return true;
  
  // Retry em timeouts
  if (error instanceof TimeoutError) return true;
  
  // Retry em 500, 502, 503, 504
  if (error.statusCode >= 500 && error.statusCode < 600) return true;
  
  // Retry em 429 (too many requests)
  if (error.statusCode === 429) return true;
  
  return false;
};

/* ============================================================================
   SAFE API CLIENT
   ============================================================================ */

class SafeApiClient {
  constructor(baseURL = API_BASE_URL, defaultHeaders = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...defaultHeaders,
    };
    this.interceptors = {
      request: [],
      response: [],
    };
  }

  /**
   * Adiciona interceptor de request
   */
  addRequestInterceptor(fn) {
    this.interceptors.request.push(fn);
  }

  /**
   * Adiciona interceptor de response
   */
  addResponseInterceptor(fn) {
    this.interceptors.response.push(fn);
  }

  /**
   * Aplica interceptors de request
   */
  async applyRequestInterceptors(config) {
    let modifiedConfig = { ...config };
    
    for (const interceptor of this.interceptors.request) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    
    return modifiedConfig;
  }

  /**
   * Aplica interceptors de response
   */
  async applyResponseInterceptors(response) {
    let modifiedResponse = response;
    
    for (const interceptor of this.interceptors.response) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    
    return modifiedResponse;
  }

  /**
   * Constrói URL completa
   */
  buildUrl(endpoint) {
    // Se já for URL completa, retorna
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    // Remove barra dupla
    const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${base}${path}`;
  }

  /**
   * Request genérico com retry e timeout
   */
  async request(endpoint, options = {}, attempt = 0) {
    const {
      method = 'GET',
      headers = {},
      body = null,
      timeout = DEFAULT_TIMEOUT,
      token = null,
      params = null,
      ...fetchOptions
    } = options;

    try {
      // Constrói URL com query params
      let url = this.buildUrl(endpoint);
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            searchParams.append(key, value);
          }
        });
        url += `?${searchParams.toString()}`;
      }

      // Monta headers
      const requestHeaders = {
        ...this.defaultHeaders,
        ...headers,
      };

      // Adiciona token se fornecido
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      // Monta config do request
      let config = {
        method,
        headers: requestHeaders,
        ...fetchOptions,
      };

      // Adiciona body se não for GET/HEAD
      if (body && !['GET', 'HEAD'].includes(method)) {
        config.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      // Aplica interceptors de request
      config = await this.applyRequestInterceptors(config);

      // Faz request com timeout
      const response = await withTimeout(
        fetch(url, config),
        timeout
      );

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          throw new ApiError(
            'Erro ao processar resposta do servidor',
            response.status,
            parseError,
            await response.text()
          );
        }
      } else {
        data = await response.text();
      }

      // Aplica interceptors de response
      data = await this.applyResponseInterceptors(data);

      // Trata erros HTTP
      if (!response.ok) {
        const errorMessage = safeGet(data, 'error') || 
                            safeGet(data, 'mensagem') || 
                            safeGet(data, 'message') ||
                            `Erro HTTP ${response.status}`;

        // Erros de validação
        if (response.status === 422) {
          throw new ValidationError(
            errorMessage,
            safeGet(data, 'errors') || safeGet(data, 'erros') || {}
          );
        }

        throw new ApiError(errorMessage, response.status, null, data);
      }

      // Normaliza resposta
      return normalizeApiResponse(data);

    } catch (error) {
      // Trata erros de rede
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkError = new NetworkError();
        
        // Retry se aplicável
        if (shouldRetry(networkError, attempt)) {
          await sleep(RETRY_DELAY * (attempt + 1));
          return this.request(endpoint, options, attempt + 1);
        }
        
        throw networkError;
      }

      // Retry para outros erros retriáveis
      if (shouldRetry(error, attempt)) {
        await sleep(RETRY_DELAY * (attempt + 1));
        return this.request(endpoint, options, attempt + 1);
      }

      // Re-throw ApiErrors
      if (error instanceof ApiError) {
        throw error;
      }

      // Wrap outros erros
      throw new ApiError(
        error.message || 'Erro desconhecido',
        null,
        error
      );
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * GET com extração automática de array
   */
  async getArray(endpoint, preferredKey = null, options = {}) {
    const response = await this.get(endpoint, options);
    return extractArrayFromResponse(response, preferredKey);
  }

  /**
   * POST com extração automática de array
   */
  async postArray(endpoint, body, preferredKey = null, options = {}) {
    const response = await this.post(endpoint, body, options);
    return extractArrayFromResponse(response, preferredKey);
  }
}

/* ============================================================================
   SINGLETON INSTANCE
   ============================================================================ */

const apiClient = new SafeApiClient();

// Interceptor padrão para logging (apenas em desenvolvimento)
if (import.meta.env.MODE === 'development') {
  apiClient.addRequestInterceptor((config) => {
    console.log('[API Request]', config.method, config);
    return config;
  });

  apiClient.addResponseInterceptor((response) => {
    console.log('[API Response]', response);
    return response;
  });
}

/* ============================================================================
   CONVENIENCE EXPORTS
   ============================================================================ */

export const api = apiClient;

// Exports com nomes que não conflitam com dataSafety.js
export const apiGet = (endpoint, options) => apiClient.get(endpoint, options);
export const apiPost = (endpoint, body, options) => apiClient.post(endpoint, body, options);
export const apiPut = (endpoint, body, options) => apiClient.put(endpoint, body, options);
export const apiPatch = (endpoint, body, options) => apiClient.patch(endpoint, body, options);
export const apiDelete = (endpoint, options) => apiClient.delete(endpoint, options);

export const getArray = (endpoint, preferredKey, options) => 
  apiClient.getArray(endpoint, preferredKey, options);

export const postArray = (endpoint, body, preferredKey, options) => 
  apiClient.postArray(endpoint, body, preferredKey, options);

/* ============================================================================
   REACT HOOKS INTEGRATION
   ============================================================================ */

/**
 * Hook para facilitar uso do safe API em componentes
 */
export const useSafeApi = (token = null) => {
  const makeRequest = (method, endpoint, bodyOrOptions, options = {}) => {
    const finalOptions = token ? { ...options, token } : options;
    
    if (method === 'get' || method === 'delete') {
      return apiClient[method](endpoint, finalOptions);
    }
    
    return apiClient[method](endpoint, bodyOrOptions, finalOptions);
  };

  return {
    get: (endpoint, options) => makeRequest('get', endpoint, options),
    post: (endpoint, body, options) => makeRequest('post', endpoint, body, options),
    put: (endpoint, body, options) => makeRequest('put', endpoint, body, options),
    patch: (endpoint, body, options) => makeRequest('patch', endpoint, body, options),
    delete: (endpoint, options) => makeRequest('delete', endpoint, options),
    getArray: (endpoint, preferredKey, options) => 
      apiClient.getArray(endpoint, preferredKey, { ...options, token }),
    postArray: (endpoint, body, preferredKey, options) => 
      apiClient.postArray(endpoint, body, preferredKey, { ...options, token }),
  };
};

export default apiClient;
