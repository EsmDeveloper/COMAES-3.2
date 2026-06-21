/**
 * 🛡️ SAFE DATA HOOKS - Enterprise Grade
 * 
 * React Hooks que aplicam automaticamente validação e sanitização de dados.
 * Previnem crashes por dados inválidos ou estados inconsistentes.
 * 
 * @module useSafeData
 * @version 2.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  safeArray, 
  normalizeApiResponse,
  extractArrayFromResponse,
  safeGet 
} from '../utils/dataSafety';
import { api, ApiError } from '../utils/safeApi';

/* ============================================================================
   useSafeFetch - Fetch com validação automática
   ============================================================================ */

/**
 * Hook para fetch de dados com validação automática
 * 
 * @example
 * const { data, loading, error, refetch } = useSafeFetch('/api/users', {
 *   token,
 *   dataPath: 'users',
 *   initialData: []
 * });
 */
export const useSafeFetch = (endpoint, options = {}) => {
  const {
    token = null,
    method = 'GET',
    body = null,
    dataPath = null,
    initialData = null,
    autoFetch = true,
    onSuccess = null,
    onError = null,
    deps = [],
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const isMountedRef = useRef(true);
  const controllerRef = useRef(null);

  const fetchData = useCallback(async (overrideOptions = {}) => {
    // Cancel requisição anterior se existir
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const requestOptions = {
        method: overrideOptions.method || method,
        token: overrideOptions.token || token,
        body: overrideOptions.body || body,
        signal: controllerRef.current.signal,
      };

      const response = await api.request(
        overrideOptions.endpoint || endpoint,
        requestOptions
      );

      if (!isMountedRef.current) return;

      // Extrai dados do caminho especificado ou usa data diretamente
      let extractedData = response.data;
      
      if (dataPath && response.success) {
        extractedData = safeGet(response.data, dataPath, response.data);
      }

      setData(extractedData);
      setLastFetch(new Date());
      
      if (onSuccess) {
        onSuccess(extractedData, response);
      }

      return extractedData;

    } catch (err) {
      if (!isMountedRef.current) return;
      
      // Ignora erros de abort
      if (err.name === 'AbortError') return;

      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Erro ao carregar dados';

      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }

      return null;

    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [endpoint, method, token, body, dataPath, onSuccess, onError]);

  // Auto-fetch on mount ou quando deps mudarem
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [autoFetch, fetchData, ...deps]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastFetch,
  };
};

/* ============================================================================
   useSafeArray - Garante array válido em todos os estados
   ============================================================================ */

/**
 * Hook para garantir array válido com fetch automático
 * 
 * @example
 * const { items, loading, error, refetch } = useSafeArray('/api/items', {
 *   token,
 *   initialItems: []
 * });
 */
export const useSafeArray = (endpoint, options = {}) => {
  const {
    token = null,
    preferredKey = null,
    initialItems = [],
    autoFetch = true,
    onSuccess = null,
    onError = null,
    deps = [],
  } = options;

  const [items, setItems] = useState(safeArray(initialItems));
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const isMountedRef = useRef(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getArray(endpoint, preferredKey, { token });
      
      if (!isMountedRef.current) return;

      const validArray = safeArray(response);
      setItems(validArray);
      setLastFetch(new Date());
      
      if (onSuccess) {
        onSuccess(validArray);
      }

      return validArray;

    } catch (err) {
      if (!isMountedRef.current) return;

      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Erro ao carregar lista';

      setError(errorMessage);
      setItems(initialItems);
      
      if (onError) {
        onError(err);
      }

      return initialItems;

    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [endpoint, token, preferredKey, initialItems, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      fetchItems();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [autoFetch, fetchItems, ...deps]);

  // Garante que items é sempre array
  const safeItems = safeArray(items);

  return {
    items: safeItems,
    loading,
    error,
    refetch: fetchItems,
    lastFetch,
    isEmpty: safeItems.length === 0,
    count: safeItems.length,
  };
};

/* ============================================================================
   useSafeState - useState com validação
   ============================================================================ */

/**
 * useState com validação automática
 * 
 * @example
 * const [value, setValue] = useSafeState('', {
 *   validate: (v) => typeof v === 'string',
 *   sanitize: (v) => String(v || '')
 * });
 */
export const useSafeState = (initialValue, options = {}) => {
  const {
    validate = null,
    sanitize = null,
    onInvalid = null,
  } = options;

  const [value, setValueInternal] = useState(() => {
    if (sanitize) {
      return sanitize(initialValue);
    }
    return initialValue;
  });

  const setValue = useCallback((newValue) => {
    let processedValue = newValue;

    // Se for função updater, aplica primeiro
    if (typeof newValue === 'function') {
      setValueInternal((prev) => {
        processedValue = newValue(prev);
        
        // Valida
        if (validate && !validate(processedValue)) {
          if (onInvalid) {
            onInvalid(processedValue);
          }
          return prev; // Mantém valor anterior se inválido
        }

        // Sanitiza
        if (sanitize) {
          processedValue = sanitize(processedValue);
        }

        return processedValue;
      });
    } else {
      // Valida
      if (validate && !validate(processedValue)) {
        if (onInvalid) {
          onInvalid(processedValue);
        }
        return; // Não atualiza se inválido
      }

      // Sanitiza
      if (sanitize) {
        processedValue = sanitize(processedValue);
      }

      setValueInternal(processedValue);
    }
  }, [validate, sanitize, onInvalid]);

  return [value, setValue];
};

/* ============================================================================
   useSafePagination - Paginação com validação
   ============================================================================ */

/**
 * Hook para paginação segura
 * 
 * @example
 * const { items, page, setPage, totalPages, loading } = useSafePagination(
 *   '/api/items',
 *   { token, pageSize: 20 }
 * );
 */
export const useSafePagination = (endpoint, options = {}) => {
  const {
    token = null,
    pageSize = 20,
    initialPage = 1,
    dataPath = null,
    onSuccess = null,
    onError = null,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalPages = Math.ceil(totalItems / pageSize);

  const fetchPage = useCallback(async (pageNum) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(endpoint, {
        token,
        params: {
          page: pageNum,
          limit: pageSize,
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar página');
      }

      let extractedData = response.data;
      
      if (dataPath) {
        extractedData = safeGet(response.data, dataPath, response.data);
      }

      const validItems = safeArray(extractedData);
      setItems(validItems);

      // Tenta extrair total de vários caminhos possíveis
      const total = safeGet(response, 'meta.total') || 
                    safeGet(response, 'data.total') ||
                    safeGet(response, 'total') ||
                    validItems.length;
      
      setTotalItems(total);

      if (onSuccess) {
        onSuccess(validItems, pageNum);
      }

    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Erro ao carregar página';

      setError(errorMessage);
      setItems([]);
      
      if (onError) {
        onError(err);
      }

    } finally {
      setLoading(false);
    }
  }, [endpoint, token, pageSize, dataPath, onSuccess, onError]);

  useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const goToPage = useCallback((pageNum) => {
    const validPage = Math.max(1, Math.min(pageNum, totalPages || 1));
    setPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(p => p + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  }, [page]);

  return {
    items: safeArray(items),
    page,
    totalPages,
    totalItems,
    pageSize,
    loading,
    error,
    setPage: goToPage,
    nextPage,
    prevPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    refetch: () => fetchPage(page),
  };
};

/* ============================================================================
   useSafeForm - Formulário com validação
   ============================================================================ */

/**
 * Hook para formulários com validação
 * 
 * @example
 * const { values, errors, handleChange, handleSubmit } = useSafeForm({
 *   initialValues: { name: '', email: '' },
 *   validate: (values) => {
 *     const errors = {};
 *     if (!values.name) errors.name = 'Nome obrigatório';
 *     return errors;
 *   },
 *   onSubmit: async (values) => {
 *     await api.post('/api/users', values);
 *   }
 * });
 */
export const useSafeForm = (options = {}) => {
  const {
    initialValues = {},
    validate = null,
    onSubmit,
    sanitizeValues = null,
  } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpa erro do campo ao editar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Marca todos os campos como touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Valida
    let validationErrors = {};
    if (validate) {
      validationErrors = validate(values) || {};
    }

    setErrors(validationErrors);

    // Se houver erros, não submete
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      let finalValues = values;
      
      // Sanitiza valores se fornecido
      if (sanitizeValues) {
        finalValues = sanitizeValues(values);
      }

      await onSubmit(finalValues);
      
    } catch (err) {
      // Se o erro for de validação do servidor, atualiza errors
      if (err.name === 'ValidationError') {
        setErrors(err.errors || {});
      }
      
      throw err;
      
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit, sanitizeValues]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
};

/* ============================================================================
   EXPORTS
   ============================================================================ */

export default {
  useSafeFetch,
  useSafeArray,
  useSafeState,
  useSafePagination,
  useSafeForm,
};
