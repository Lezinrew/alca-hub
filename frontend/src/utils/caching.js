// Sistema de Cache Avançado - Alça Hub
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// Hook para cache em memória
export const useMemoryCache = (maxSize = 100, ttl = 300000) => {
  const [cache, setCache] = useState(new Map())
  const [timestamps, setTimestamps] = useState(new Map())
  const [accessCounts, setAccessCounts] = useState(new Map())

  const get = useCallback((key) => {
    const now = Date.now()
    const timestamp = timestamps.get(key)
    
    // Verificar TTL
    if (timestamp && (now - timestamp) > ttl) {
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(key)
        return newCache
      })
      setTimestamps(prev => {
        const newTimestamps = new Map(prev)
        newTimestamps.delete(key)
        return newTimestamps
      })
      setAccessCounts(prev => {
        const newAccessCounts = new Map(prev)
        newAccessCounts.delete(key)
        return newAccessCounts
      })
      return null
    }

    // Atualizar contador de acesso
    setAccessCounts(prev => {
      const newAccessCounts = new Map(prev)
      newAccessCounts.set(key, (newAccessCounts.get(key) || 0) + 1)
      return newAccessCounts
    })

    return cache.get(key)
  }, [cache, timestamps, ttl])

  const set = useCallback((key, value) => {
    const now = Date.now()
    
    // Verificar se precisa remover itens antigos
    if (cache.size >= maxSize) {
      const oldestKey = Array.from(timestamps.entries())
        .sort(([,a], [,b]) => a - b)[0][0]
      
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(oldestKey)
        return newCache
      })
      setTimestamps(prev => {
        const newTimestamps = new Map(prev)
        newTimestamps.delete(oldestKey)
        return newTimestamps
      })
      setAccessCounts(prev => {
        const newAccessCounts = new Map(prev)
        newAccessCounts.delete(oldestKey)
        return newAccessCounts
      })
    }

    setCache(prev => new Map([...prev, [key, value]]))
    setTimestamps(prev => new Map([...prev, [key, now]]))
    setAccessCounts(prev => new Map([...prev, [key, 1]]))
  }, [cache, timestamps, maxSize])

  const remove = useCallback((key) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(key)
      return newCache
    })
    setTimestamps(prev => {
      const newTimestamps = new Map(prev)
      newTimestamps.delete(key)
      return newTimestamps
    })
    setAccessCounts(prev => {
      const newAccessCounts = new Map(prev)
      newAccessCounts.delete(key)
      return newAccessCounts
    })
  }, [])

  const clear = useCallback(() => {
    setCache(new Map())
    setTimestamps(new Map())
    setAccessCounts(new Map())
  }, [])

  const has = useCallback((key) => {
    return cache.has(key) && timestamps.has(key)
  }, [cache, timestamps])

  const size = cache.size

  return {
    get,
    set,
    remove,
    clear,
    has,
    size,
    cache: Array.from(cache.entries())
  }
}

// Hook para cache com LRU
export const useLRUCache = (maxSize = 100) => {
  const [cache, setCache] = useState(new Map())
  const [accessOrder, setAccessOrder] = useState([])

  const get = useCallback((key) => {
    if (!cache.has(key)) return null

    // Mover para o final da lista de acesso
    setAccessOrder(prev => {
      const newOrder = prev.filter(k => k !== key)
      newOrder.push(key)
      return newOrder
    })

    return cache.get(key)
  }, [cache])

  const set = useCallback((key, value) => {
    // Se já existe, atualizar
    if (cache.has(key)) {
      setCache(prev => new Map([...prev, [key, value]]))
      setAccessOrder(prev => {
        const newOrder = prev.filter(k => k !== key)
        newOrder.push(key)
        return newOrder
      })
      return
    }

    // Se está no limite, remover o menos usado
    if (cache.size >= maxSize) {
      const leastUsed = accessOrder[0]
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(leastUsed)
        return newCache
      })
      setAccessOrder(prev => prev.slice(1))
    }

    setCache(prev => new Map([...prev, [key, value]]))
    setAccessOrder(prev => [...prev, key])
  }, [cache, accessOrder, maxSize])

  const remove = useCallback((key) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(key)
      return newCache
    })
    setAccessOrder(prev => prev.filter(k => k !== key))
  }, [])

  const clear = useCallback(() => {
    setCache(new Map())
    setAccessOrder([])
  }, [])

  const has = useCallback((key) => {
    return cache.has(key)
  }, [cache])

  const size = cache.size

  return {
    get,
    set,
    remove,
    clear,
    has,
    size,
    cache: Array.from(cache.entries())
  }
}

// Hook para cache com TTL
export const useTTLCache = (defaultTTL = 300000) => {
  const [cache, setCache] = useState(new Map())
  const [timestamps, setTimestamps] = useState(new Map())
  const [ttls, setTtls] = useState(new Map())

  const get = useCallback((key) => {
    const now = Date.now()
    const timestamp = timestamps.get(key)
    const ttl = ttls.get(key) || defaultTTL

    if (timestamp && (now - timestamp) > ttl) {
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(key)
        return newCache
      })
      setTimestamps(prev => {
        const newTimestamps = new Map(prev)
        newTimestamps.delete(key)
        return newTimestamps
      })
      setTtls(prev => {
        const newTtls = new Map(prev)
        newTtls.delete(key)
        return newTtls
      })
      return null
    }

    return cache.get(key)
  }, [cache, timestamps, ttls, defaultTTL])

  const set = useCallback((key, value, customTTL = defaultTTL) => {
    const now = Date.now()
    
    setCache(prev => new Map([...prev, [key, value]]))
    setTimestamps(prev => new Map([...prev, [key, now]]))
    setTtls(prev => new Map([...prev, [key, customTTL]]))
  }, [defaultTTL])

  const remove = useCallback((key) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(key)
      return newCache
    })
    setTimestamps(prev => {
      const newTimestamps = new Map(prev)
      newTimestamps.delete(key)
      return newTimestamps
    })
    setTtls(prev => {
      const newTtls = new Map(prev)
      newTtls.delete(key)
      return newTtls
    })
  }, [])

  const clear = useCallback(() => {
    setCache(new Map())
    setTimestamps(new Map())
    setTtls(new Map())
  }, [])

  const has = useCallback((key) => {
    const now = Date.now()
    const timestamp = timestamps.get(key)
    const ttl = ttls.get(key) || defaultTTL

    return cache.has(key) && timestamp && (now - timestamp) <= ttl
  }, [cache, timestamps, ttls, defaultTTL])

  const size = cache.size

  return {
    get,
    set,
    remove,
    clear,
    has,
    size,
    cache: Array.from(cache.entries())
  }
}

// Hook para cache com persistência
export const usePersistentCache = (keyPrefix = 'cache_') => {
  const [cache, setCache] = useState(new Map())
  const [loading, setLoading] = useState(true)

  // Carregar cache do localStorage
  useEffect(() => {
    const loadCache = () => {
      try {
        const saved = localStorage.getItem(`${keyPrefix}data`)
        if (saved) {
          const data = JSON.parse(saved)
          setCache(new Map(data))
        }
      } catch (error) {
        console.error('Error loading cache from localStorage:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCache()
  }, [keyPrefix])

  // Salvar cache no localStorage
  const saveCache = useCallback((newCache) => {
    try {
      localStorage.setItem(`${keyPrefix}data`, JSON.stringify(Array.from(newCache.entries())))
    } catch (error) {
      console.error('Error saving cache to localStorage:', error)
    }
  }, [keyPrefix])

  const get = useCallback((key) => {
    return cache.get(key)
  }, [cache])

  const set = useCallback((key, value) => {
    const newCache = new Map([...cache, [key, value]])
    setCache(newCache)
    saveCache(newCache)
  }, [cache, saveCache])

  const remove = useCallback((key) => {
    const newCache = new Map(cache)
    newCache.delete(key)
    setCache(newCache)
    saveCache(newCache)
  }, [cache, saveCache])

  const clear = useCallback(() => {
    setCache(new Map())
    try {
      localStorage.removeItem(`${keyPrefix}data`)
    } catch (error) {
      console.error('Error clearing cache from localStorage:', error)
    }
  }, [keyPrefix])

  const has = useCallback((key) => {
    return cache.has(key)
  }, [cache])

  const size = cache.size

  return {
    get,
    set,
    remove,
    clear,
    has,
    size,
    loading,
    cache: Array.from(cache.entries())
  }
}

// Hook para cache com compressão
export const useCompressedCache = () => {
  const [cache, setCache] = useState(new Map())

  const compress = useCallback((data) => {
    try {
      return btoa(JSON.stringify(data))
    } catch (error) {
      console.error('Error compressing data:', error)
      return data
    }
  }, [])

  const decompress = useCallback((data) => {
    try {
      return JSON.parse(atob(data))
    } catch (error) {
      console.error('Error decompressing data:', error)
      return data
    }
  }, [])

  const get = useCallback((key) => {
    const compressed = cache.get(key)
    if (!compressed) return null
    
    return decompress(compressed)
  }, [cache, decompress])

  const set = useCallback((key, value) => {
    const compressed = compress(value)
    setCache(prev => new Map([...prev, [key, compressed]]))
  }, [compress])

  const remove = useCallback((key) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(key)
      return newCache
    })
  }, [])

  const clear = useCallback(() => {
    setCache(new Map())
  }, [])

  const has = useCallback((key) => {
    return cache.has(key)
  }, [cache])

  const size = cache.size

  return {
    get,
    set,
    remove,
    clear,
    has,
    size,
    cache: Array.from(cache.entries())
  }
}

// Hook para cache com versionamento
export const useVersionedCache = () => {
  const [cache, setCache] = useState(new Map())
  const [versions, setVersions] = useState(new Map())

  const get = useCallback((key, version) => {
    const cachedVersion = versions.get(key)
    if (cachedVersion !== version) return null
    
    return cache.get(key)
  }, [cache, versions])

  const set = useCallback((key, value, version) => {
    setCache(prev => new Map([...prev, [key, value]]))
    setVersions(prev => new Map([...prev, [key, version]]))
  }, [])

  const remove = useCallback((key) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(key)
      return newCache
    })
    setVersions(prev => {
      const newVersions = new Map(prev)
      newVersions.delete(key)
      return newVersions
    })
  }, [])

  const clear = useCallback(() => {
    setCache(new Map())
    setVersions(new Map())
  }, [])

  const has = useCallback((key, version) => {
    const cachedVersion = versions.get(key)
    return cache.has(key) && cachedVersion === version
  }, [cache, versions])

  const size = cache.size

  return {
    get,
    set,
    remove,
    clear,
    has,
    size,
    cache: Array.from(cache.entries())
  }
}

// Hook para cache com invalidação
export const useInvalidationCache = () => {
  const [cache, setCache] = useState(new Map())
  const [dependencies, setDependencies] = useState(new Map())

  const get = useCallback((key) => {
    return cache.get(key)
  }, [cache])

  const set = useCallback((key, value, deps = []) => {
    setCache(prev => new Map([...prev, [key, value]]))
    setDependencies(prev => new Map([...prev, [key, deps]]))
  }, [])

  const remove = useCallback((key) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(key)
      return newCache
    })
    setDependencies(prev => {
      const newDeps = new Map(prev)
      newDeps.delete(key)
      return newDeps
    })
  }, [])

  const clear = useCallback(() => {
    setCache(new Map())
    setDependencies(new Map())
  }, [])

  const has = useCallback((key) => {
    return cache.has(key)
  }, [cache])

  const invalidate = useCallback((key) => {
    // Invalidar item específico
    if (key) {
      remove(key)
      return
    }

    // Invalidar todos os itens que dependem de uma chave
    const toInvalidate = []
    for (const [cacheKey, deps] of dependencies.entries()) {
      if (deps.includes(key)) {
        toInvalidate.push(cacheKey)
      }
    }

    toInvalidate.forEach(cacheKey => remove(cacheKey))
  }, [remove, dependencies])

  const size = cache.size

  return {
    get,
    set,
    remove,
    clear,
    has,
    invalidate,
    size,
    cache: Array.from(cache.entries())
  }
}

// Hook para cache com limpeza automática
export const useAutoCleanupCache = (cleanupInterval = 60000) => {
  const [cache, setCache] = useState(new Map())
  const [timestamps, setTimestamps] = useState(new Map())
  const [ttls, setTtls] = useState(new Map())

  // Limpeza automática
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const toRemove = []

      for (const [key, timestamp] of timestamps.entries()) {
        const ttl = ttls.get(key) || 300000 // 5 minutos padrão
        if (now - timestamp > ttl) {
          toRemove.push(key)
        }
      }

      if (toRemove.length > 0) {
        setCache(prev => {
          const newCache = new Map(prev)
          toRemove.forEach(key => newCache.delete(key))
          return newCache
        })
        setTimestamps(prev => {
          const newTimestamps = new Map(prev)
          toRemove.forEach(key => newTimestamps.delete(key))
          return newTimestamps
        })
        setTtls(prev => {
          const newTtls = new Map(prev)
          toRemove.forEach(key => newTtls.delete(key))
          return newTtls
        })
      }
    }, cleanupInterval)

    return () => clearInterval(interval)
  }, [cleanupInterval, timestamps, ttls])

  const get = useCallback((key) => {
    const now = Date.now()
    const timestamp = timestamps.get(key)
    const ttl = ttls.get(key) || 300000

    if (timestamp && (now - timestamp) > ttl) {
      remove(key)
      return null
    }

    return cache.get(key)
  }, [cache, timestamps, ttls])

  const set = useCallback((key, value, customTTL = 300000) => {
    const now = Date.now()
    
    setCache(prev => new Map([...prev, [key, value]]))
    setTimestamps(prev => new Map([...prev, [key, now]]))
    setTtls(prev => new Map([...prev, [key, customTTL]]))
  }, [])

  const remove = useCallback((key) => {
    setCache(prev => {
      const newCache = new Map(prev)
      newCache.delete(key)
      return newCache
    })
    setTimestamps(prev => {
      const newTimestamps = new Map(prev)
      newTimestamps.delete(key)
      return newTimestamps
    })
    setTtls(prev => {
      const newTtls = new Map(prev)
      newTtls.delete(key)
      return newTtls
    })
  }, [])

  const clear = useCallback(() => {
    setCache(new Map())
    setTimestamps(new Map())
    setTtls(new Map())
  }, [])

  const has = useCallback((key) => {
    const now = Date.now()
    const timestamp = timestamps.get(key)
    const ttl = ttls.get(key) || 300000

    return cache.has(key) && timestamp && (now - timestamp) <= ttl
  }, [cache, timestamps, ttls])

  const size = cache.size

  return {
    get,
    set,
    remove,
    clear,
    has,
    size,
    cache: Array.from(cache.entries())
  }
}

// Hook para cache com estatísticas
export const useCacheStats = () => {
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0
  })

  const recordHit = useCallback(() => {
    setStats(prev => {
      const newHits = prev.hits + 1
      const total = newHits + prev.misses
      return {
        ...prev,
        hits: newHits,
        hitRate: total > 0 ? (newHits / total) * 100 : 0
      }
    })
  }, [])

  const recordMiss = useCallback(() => {
    setStats(prev => {
      const newMisses = prev.misses + 1
      const total = prev.hits + newMisses
      return {
        ...prev,
        misses: newMisses,
        hitRate: total > 0 ? (prev.hits / total) * 100 : 0
      }
    })
  }, [])

  const updateSize = useCallback((size) => {
    setStats(prev => ({ ...prev, size }))
  }, [])

  const reset = useCallback(() => {
    setStats({
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0
    })
  }, [])

  return {
    stats,
    recordHit,
    recordMiss,
    updateSize,
    reset
  }
}

// Exportar tudo
export default {
  useMemoryCache,
  useLRUCache,
  useTTLCache,
  usePersistentCache,
  useCompressedCache,
  useVersionedCache,
  useInvalidationCache,
  useAutoCleanupCache,
  useCacheStats
}
