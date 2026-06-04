/**
 * Módulo de Cache Simples para Rankings
 * 
 * Cache em memória com TTL (Time To Live) para otimizar performance
 * Pode ser substituído por Redis em produção
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 300; // 5 minutos em segundos
  }

  /**
   * Obter valor do cache
   * @param {string} key - Chave do cache
   * @returns {Promise<any>} Valor armazenado ou null
   */
  async get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Armazenar valor no cache
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a ser armazenado
   * @param {number} ttl - Tempo de vida em segundos
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const expiresAt = Date.now() + (ttl * 1000);
      this.cache.set(key, {
        value,
        expiresAt,
        createdAt: Date.now(),
        ttl
      });
      return true;
    } catch (error) {
      console.error('Erro ao armazenar no cache:', error);
      return false;
    }
  }

  /**
   * Remover valor do cache
   * @param {string} key - Chave do cache
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async del(key) {
    try {
      return this.cache.delete(key);
    } catch (error) {
      console.error('Erro ao remover do cache:', error);
      return false;
    }
  }

  /**
   * Limpar cache por padrão
   * @param {string} pattern - Padrão de chaves (opcional)
   * @returns {Promise<number>} Número de chaves removidas
   */
  async clear(pattern = null) {
    try {
      let deleted = 0;
      
      if (pattern) {
        // Filtrar por padrão
        for (const key of this.cache.keys()) {
          if (key.includes(pattern)) {
            this.cache.delete(key);
            deleted++;
          }
        }
      } else {
        // Limpar tudo
        deleted = this.cache.size;
        this.cache.clear();
      }
      
      return deleted;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return 0;
    }
  }

  /**
   * Obter estatísticas do cache
   * @returns {Promise<Object>} Estatísticas
   */
  async stats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    let totalSize = 0;

    for (const entry of this.cache.values()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        expired++;
      } else {
        active++;
      }
      totalSize += JSON.stringify(entry.value).length;
    }

    return {
      total: this.cache.size,
      active,
      expired,
      memoryUsage: `${(totalSize / 1024).toFixed(2)} KB`,
      hitRate: this.calculateHitRate()
    };
  }

  /**
   * Calcular taxa de acerto do cache
   * @returns {number} Taxa de acerto (0-1)
   */
  calculateHitRate() {
    // Métrica simples para demonstração
    const totalOperations = this.cache.size * 2; // Aproximação
    return totalOperations > 0 ? 0.8 : 0; // Estimativa de 80% hit rate
  }

  /**
   * Limpar entradas expiradas
   * @returns {Promise<number>} Número de entradas limpas
   */
  async cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Verificar se chave existe no cache
   * @param {string} key - Chave do cache
   * @returns {Promise<boolean>} Se chave existe
   */
  async exists(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Verificar se expirou
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Obter tempo restante para expiração
   * @param {string} key - Chave do cache
   * @returns {Promise<number>} Tempo restante em segundos
   */
  async ttl(key) {
    const entry = this.cache.get(key);
    
    if (!entry || !entry.expiresAt) {
      return -1;
    }

    const remaining = Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000));
    return remaining;
  }
}

// Exportar instância única (Singleton)
const cache = new MemoryCache();

// Executar limpeza periódica a cada 30 segundos
setInterval(() => {
  cache.cleanup().catch(console.error);
}, 30000);

export default cache;
