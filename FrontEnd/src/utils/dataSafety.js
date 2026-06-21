/**
 * 🛡️ DATA SAFETY LAYER - Enterprise Grade
 * 
 * Camada global de segurança de dados para prevenir crashes de renderização.
 * Todas as funções garantem retornos seguros e previsíveis.
 * 
 * @module dataSafety
 * @version 2.0.0
 */

/* ============================================================================
   CORE UTILITIES - Funções base de segurança
   ============================================================================ */

/**
 * Verifica se um valor é null ou undefined
 */
export const isNil = (value) => value === null || value === undefined;

/**
 * Verifica se um valor é um objeto válido (não null, não array)
 */
export const isObject = (value) => 
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Verifica se um valor pode ser renderizado com segurança no JSX
 */
export const isRenderSafe = (value) => {
  if (isNil(value)) return false;
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean';
};

/* ============================================================================
   SAFE ACCESS - Acesso seguro a propriedades aninhadas
   ============================================================================ */

/**
 * Acessa propriedades aninhadas com segurança (lodash _.get style)
 * 
 * @param {Object} obj - Objeto fonte
 * @param {string|Array} path - Caminho (ex: 'user.profile.name' ou ['user', 'profile', 'name'])
 * @param {*} defaultValue - Valor padrão se não encontrado
 * @returns {*} Valor encontrado ou defaultValue
 * 
 * @example
 * safeGet(user, 'profile.name', 'Anonymous')
 * safeGet(data, ['items', 0, 'title'], 'Untitled')
 */
export const safeGet = (obj, path, defaultValue = null) => {
  if (isNil(obj)) return defaultValue;
  
  const pathArray = Array.isArray(path) 
    ? path 
    : path.toString().split('.');
  
  let current = obj;
  
  for (let i = 0; i < pathArray.length; i++) {
    if (isNil(current)) return defaultValue;
    current = current[pathArray[i]];
  }
  
  return isNil(current) ? defaultValue : current;
};

/**
 * Acessa múltiplos caminhos e retorna o primeiro valor válido
 * 
 * @example
 * safeGetAny(data, ['data.users', 'users', 'data'], [])
 */
export const safeGetAny = (obj, paths, defaultValue = null) => {
  for (const path of paths) {
    const value = safeGet(obj, path);
    if (!isNil(value)) return value;
  }
  return defaultValue;
};

/* ============================================================================
   SAFE ARRAY - Garantia de arrays válidos
   ============================================================================ */

/**
 * Garante que um valor é um array válido
 * 
 * @param {*} value - Valor a validar
 * @param {Array} defaultValue - Array padrão se inválido
 * @returns {Array} Array válido garantido
 * 
 * @example
 * safeArray(items) // [] se items for null/undefined
 * safeArray(items, ['default']) // ['default'] se items for inválido
 */
export const safeArray = (value, defaultValue = []) => {
  if (Array.isArray(value)) return value;
  if (isNil(value)) return defaultValue;
  // Se for um valor único válido, transforma em array
  if (isRenderSafe(value)) return [value];
  return defaultValue;
};

/**
 * Filtra elementos nulos/undefined de um array
 * 
 * @example
 * compactArray([1, null, 2, undefined, 3]) // [1, 2, 3]
 */
export const compactArray = (arr) => {
  return safeArray(arr).filter(item => !isNil(item));
};

/**
 * Valida e limpa um array para uso em .map()
 * 
 * @param {*} arr - Array a validar
 * @param {Function} filterFn - Função de filtro adicional (opcional)
 * @returns {Array} Array limpo e válido
 * 
 * @example
 * safeMappableArray(users, u => u.active === true)
 */
export const safeMappableArray = (arr, filterFn = null) => {
  const valid = compactArray(arr);
  return filterFn ? valid.filter(filterFn) : valid;
};

/* ============================================================================
   SAFE STRING - Conversão segura para strings
   ============================================================================ */

/**
 * Converte qualquer valor para string segura para renderização
 * 
 * @param {*} value - Valor a converter
 * @param {string} defaultValue - String padrão
 * @returns {string} String segura
 * 
 * @example
 * safeString(user.name, 'Anonymous')
 * safeString(null, 'N/A') // 'N/A'
 * safeString({ name: 'John' }, 'Invalid') // 'Invalid' (não renderiza objetos)
 */
export const safeString = (value, defaultValue = '') => {
  if (isNil(value)) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  // Objetos/arrays não são seguros para renderização direta
  return defaultValue;
};

/**
 * Trunca string com segurança
 * 
 * @example
 * safeTruncate('Long text here', 10) // 'Long text...'
 */
export const safeTruncate = (str, maxLength, suffix = '...') => {
  const safe = safeString(str);
  if (safe.length <= maxLength) return safe;
  return safe.substring(0, maxLength - suffix.length) + suffix;
};

/* ============================================================================
   SAFE NUMBER - Conversão segura para números
   ============================================================================ */

/**
 * Converte para número com fallback
 * 
 * @example
 * safeNumber('123', 0) // 123
 * safeNumber('invalid', 0) // 0
 * safeNumber(null, 0) // 0
 */
export const safeNumber = (value, defaultValue = 0) => {
  if (isNil(value)) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Formata número com locale pt-BR
 */
export const safeFormatNumber = (value, decimals = 0) => {
  const num = safeNumber(value, 0);
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/* ============================================================================
   SAFE DATE - Tratamento seguro de datas
   ============================================================================ */

/**
 * Converte para Date com validação
 * 
 * @example
 * safeDate('2024-01-01') // Date object
 * safeDate('invalid') // null
 * safeDate(null, new Date()) // Date atual
 */
export const safeDate = (value, defaultValue = null) => {
  if (isNil(value)) return defaultValue;
  
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? defaultValue : date;
  } catch {
    return defaultValue;
  }
};

/**
 * Formata data com segurança
 * 
 * @example
 * safeFormatDate('2024-01-01', 'pt-BR') // '01/01/2024'
 * safeFormatDate(null, 'pt-BR', 'Data inválida') // 'Data inválida'
 */
export const safeFormatDate = (value, locale = 'pt-BR', fallback = 'Data inválida', options = {}) => {
  const date = safeDate(value);
  if (!date) return fallback;
  
  try {
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options,
    });
  } catch {
    return fallback;
  }
};

/**
 * Formata data/hora com segurança
 */
export const safeFormatDateTime = (value, locale = 'pt-BR', fallback = 'Data inválida') => {
  return safeFormatDate(value, locale, fallback, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ============================================================================
   SANITIZE ENTITY - Limpeza de entidades
   ============================================================================ */

/**
 * Sanitiza objeto para renderização segura
 * Remove propriedades com valores inseguros
 * 
 * @param {Object} entity - Entidade a sanitizar
 * @param {Array<string>} allowedKeys - Keys permitidas (opcional)
 * @returns {Object} Objeto sanitizado
 * 
 * @example
 * sanitizeEntity({ name: 'John', data: { nested: 'ok' } })
 * // { name: 'John', data: '[Object]' }
 */
export const sanitizeEntity = (entity, allowedKeys = null) => {
  if (!isObject(entity)) return {};
  
  const sanitized = {};
  const keys = allowedKeys || Object.keys(entity);
  
  for (const key of keys) {
    const value = entity[key];
    
    if (isNil(value)) {
      sanitized[key] = null;
    } else if (isRenderSafe(value)) {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.length;
    } else if (isObject(value)) {
      sanitized[key] = '[Object]';
    } else {
      sanitized[key] = String(value);
    }
  }
  
  return sanitized;
};

/**
 * Converte objeto para string renderizável
 * 
 * @example
 * toRenderableString({ name: 'John' }) // 'name: John'
 * toRenderableString([1, 2, 3]) // '1, 2, 3'
 */
export const toRenderableString = (value, fallback = 'N/A') => {
  if (isNil(value)) return fallback;
  if (isRenderSafe(value)) return String(value);
  
  if (Array.isArray(value)) {
    return value.map(v => safeString(v, '?')).join(', ');
  }
  
  if (isObject(value)) {
    const entries = Object.entries(value)
      .slice(0, 3) // Limita a 3 propriedades
      .map(([k, v]) => `${k}: ${safeString(v, '?')}`)
      .join(', ');
    return entries || fallback;
  }
  
  return fallback;
};

/* ============================================================================
   API RESPONSE NORMALIZATION - Padronização de respostas
   ============================================================================ */

/**
 * Normaliza resposta da API para formato consistente
 * 
 * @param {*} response - Resposta da API
 * @param {Object} options - Opções de normalização
 * @returns {Object} { success, data, error, meta }
 * 
 * @example
 * normalizeApiResponse(apiResponse)
 * // { success: true, data: [...], error: null, meta: {} }
 */
export const normalizeApiResponse = (response, options = {}) => {
  const {
    dataPath = ['data', 'dados', 'items', 'results'],
    errorPath = ['error', 'mensagem', 'message', 'erro'],
    successKey = 'success',
  } = options;
  
  // Resposta nula/undefined
  if (isNil(response)) {
    return {
      success: false,
      data: null,
      error: 'Resposta vazia da API',
      meta: {},
    };
  }
  
  // Se já estiver no formato esperado
  if (isObject(response) && successKey in response) {
    return {
      success: Boolean(response[successKey]),
      data: safeGetAny(response, dataPath, response.data || response.dados || null),
      error: safeGetAny(response, errorPath, null),
      meta: response.meta || response.metadata || {},
    };
  }
  
  // Se for array direto
  if (Array.isArray(response)) {
    return {
      success: true,
      data: response,
      error: null,
      meta: { count: response.length },
    };
  }
  
  // Se for objeto sem estrutura padrão, tenta extrair data
  if (isObject(response)) {
    const data = safeGetAny(response, dataPath, response);
    return {
      success: true,
      data,
      error: null,
      meta: {},
    };
  }
  
  // Fallback para tipos primitivos
  return {
    success: true,
    data: response,
    error: null,
    meta: {},
  };
};

/**
 * Extrai array de resposta normalizada
 * Garante sempre retornar array válido
 * 
 * @example
 * extractArrayFromResponse(response, 'users')
 * // Sempre retorna array, nunca null/undefined
 */
export const extractArrayFromResponse = (response, preferredKey = null) => {
  const normalized = normalizeApiResponse(response);
  
  if (!normalized.success) return [];
  
  const { data } = normalized;
  
  // Se data já é array
  if (Array.isArray(data)) return data;
  
  // Se data é objeto, tenta pegar array de uma key específica
  if (isObject(data)) {
    if (preferredKey && Array.isArray(data[preferredKey])) {
      return data[preferredKey];
    }
    
    // Procura primeira propriedade que seja array
    const arrayValue = Object.values(data).find(v => Array.isArray(v));
    if (arrayValue) return arrayValue;
  }
  
  // Se data não é array nem objeto com arrays, retorna vazio
  return [];
};

/* ============================================================================
   SAFE RENDER HELPERS - Helpers de renderização
   ============================================================================ */

/**
 * Wrapper seguro para .map() em JSX
 * Garante array válido e keys únicas
 * 
 * @example
 * safeMap(users, (user, index) => (
 *   <div key={user.id}>{user.name}</div>
 * ))
 */
export const safeMap = (array, renderFn, keyExtractor = null) => {
  const validArray = safeArray(array);
  
  return validArray.map((item, index) => {
    const key = keyExtractor 
      ? keyExtractor(item, index)
      : safeGet(item, 'id') || safeGet(item, '_id') || `item-${index}`;
    
    return renderFn(item, index, key);
  });
};

/**
 * Renderiza valor com fallback automático
 * 
 * @example
 * safeRender(user.name, 'Anonymous')
 * safeRender(user) // Converte objeto para string segura
 */
export const safeRender = (value, fallback = 'N/A') => {
  if (isRenderSafe(value)) return value;
  return toRenderableString(value, fallback);
};

/* ============================================================================
   IMAGE HANDLING - Tratamento de imagens
   ============================================================================ */

/**
 * Props seguras para <img> com fallback
 * 
 * @example
 * <img {...safeImageProps(user.avatar, 'User avatar')} />
 */
export const safeImageProps = (src, alt = 'Image', fallbackSrc = '/default-image.png') => {
  return {
    src: safeString(src, fallbackSrc),
    alt: safeString(alt, 'Image'),
    onError: (e) => {
      if (e.target.src !== fallbackSrc) {
        e.target.src = fallbackSrc;
      }
    },
  };
};

/* ============================================================================
   VALIDATION UTILITIES - Utilidades de validação
   ============================================================================ */

/**
 * Valida estrutura de objeto contra schema
 * 
 * @example
 * validateSchema(user, {
 *   id: 'number',
 *   name: 'string',
 *   email: 'string'
 * })
 */
export const validateSchema = (obj, schema) => {
  if (!isObject(obj)) return false;
  
  for (const [key, expectedType] of Object.entries(schema)) {
    const value = obj[key];
    
    if (expectedType === 'required' && isNil(value)) {
      return false;
    }
    
    if (!isNil(value) && typeof value !== expectedType) {
      return false;
    }
  }
  
  return true;
};

/**
 * Cria objeto com valores padrão garantidos
 * 
 * @example
 * withDefaults(user, { name: 'Anonymous', age: 0 })
 */
export const withDefaults = (obj, defaults) => {
  const result = { ...defaults };
  
  if (isObject(obj)) {
    for (const [key, defaultValue] of Object.entries(defaults)) {
      const value = obj[key];
      result[key] = isNil(value) ? defaultValue : value;
    }
  }
  
  return result;
};

/* ============================================================================
   ERROR BOUNDARIES - Helpers para ErrorBoundary
   ============================================================================ */

/**
 * Identifica tipo de erro para logging
 */
export const categorizeError = (error) => {
  const message = error?.message || String(error);
  
  if (message.includes('not valid as a React child')) {
    return 'RENDER_OBJECT_ERROR';
  }
  
  if (message.includes('Cannot read property') || message.includes('Cannot read properties')) {
    return 'NULL_ACCESS_ERROR';
  }
  
  if (message.includes('is not a function')) {
    return 'TYPE_ERROR';
  }
  
  if (message.includes('map')) {
    return 'ARRAY_MAP_ERROR';
  }
  
  return 'UNKNOWN_ERROR';
};

/**
 * Cria mensagem de erro amigável
 */
export const formatUserFriendlyError = (error) => {
  const category = categorizeError(error);
  
  const messages = {
    RENDER_OBJECT_ERROR: 'Erro ao exibir dados. Por favor, recarregue a página.',
    NULL_ACCESS_ERROR: 'Alguns dados não puderam ser carregados. Tente novamente.',
    TYPE_ERROR: 'Erro de processamento. Recarregue a página.',
    ARRAY_MAP_ERROR: 'Erro ao processar lista. Tente novamente.',
    UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Por favor, recarregue a página.',
  };
  
  return messages[category];
};

/* ============================================================================
   EXPORTS - Exportações nomeadas para tree-shaking
   ============================================================================ */

export default {
  // Core
  isNil,
  isObject,
  isRenderSafe,
  
  // Safe Access
  safeGet,
  safeGetAny,
  
  // Arrays
  safeArray,
  compactArray,
  safeMappableArray,
  
  // Strings
  safeString,
  safeTruncate,
  
  // Numbers
  safeNumber,
  safeFormatNumber,
  
  // Dates
  safeDate,
  safeFormatDate,
  safeFormatDateTime,
  
  // Sanitization
  sanitizeEntity,
  toRenderableString,
  
  // API
  normalizeApiResponse,
  extractArrayFromResponse,
  
  // Render
  safeMap,
  safeRender,
  safeImageProps,
  
  // Validation
  validateSchema,
  withDefaults,
  
  // Errors
  categorizeError,
  formatUserFriendlyError,
};
