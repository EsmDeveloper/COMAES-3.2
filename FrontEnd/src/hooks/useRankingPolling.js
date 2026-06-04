import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para polling de dados de ranking
 * 
 * @param {Function} fetchFunction - Função para buscar dados
 * @param {number} intervalMs - Intervalo de polling em milissegundos
 * @param {boolean} [enabled=true] - Se o polling está habilitado
 * @param {Array} [dependencies=[]] - Dependências para reiniciar o polling
 * 
 * @returns {Object} - Estado e funções do polling
 */
const useRankingPolling = (fetchFunction, intervalMs = 30000, enabled = true, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const fetchFunctionRef = useRef(fetchFunction);
  const enabledRef = useRef(enabled);

  // Atualizar refs
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
    enabledRef.current = enabled;
  }, [fetchFunction, enabled]);

  // Função para buscar dados
  const fetchData = useCallback(async (silent = false) => {
    if (!enabledRef.current) return;

    if (!silent) setLoading(true);
    setIsPolling(true);

    try {
      const result = await fetchFunctionRef.current();
      setData(result);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Erro no polling de ranking:', err);
      setError(err.message || 'Erro ao buscar dados');
    } finally {
      if (!silent) setLoading(false);
      setIsPolling(false);
    }
  }, []);

  // Polling automático
  useEffect(() => {
    if (!enabledRef.current) return;

    // Buscar dados imediatamente
    fetchData();

    // Configurar intervalo de polling
    const interval = setInterval(() => {
      if (enabledRef.current) {
        fetchData(true); // Silent para evitar indicadores de loading
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, fetchData, ...dependencies]);

  // Manual refresh
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    isPolling,
    refresh,
    setData
  };
};

export default useRankingPolling;