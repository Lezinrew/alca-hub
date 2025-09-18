// Memoização e Otimização de Componentes - Alça Hub
import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react'

// Hook para memoização de valores
export const useMemoizedValue = (value, deps) => {
  return useMemo(() => value, deps)
}

// Hook para memoização de funções
export const useMemoizedCallback = (callback, deps) => {
  return useCallback(callback, deps)
}

// Hook para memoização de objetos
export const useMemoizedObject = (object, deps) => {
  return useMemo(() => object, deps)
}

// Hook para memoização de arrays
export const useMemoizedArray = (array, deps) => {
  return useMemo(() => array, deps)
}

// Hook para memoização de componentes
export const useMemoizedComponent = (Component, props, deps) => {
  return useMemo(() => <Component {...props} />, deps)
}

// Hook para memoização de resultados de cálculos
export const useMemoizedCalculation = (calculation, deps) => {
  return useMemo(() => calculation(), deps)
}

// Hook para memoização de seletores
export const useMemoizedSelector = (selector, state, deps) => {
  return useMemo(() => selector(state), deps)
}

// Hook para memoização de transformações
export const useMemoizedTransform = (transform, data, deps) => {
  return useMemo(() => transform(data), deps)
}

// Hook para memoização de filtros
export const useMemoizedFilter = (filter, data, deps) => {
  return useMemo(() => data.filter(filter), deps)
}

// Hook para memoização de mapeamentos
export const useMemoizedMap = (map, data, deps) => {
  return useMemo(() => data.map(map), deps)
}

// Hook para memoização de reduções
export const useMemoizedReduce = (reduce, data, initialValue, deps) => {
  return useMemo(() => data.reduce(reduce, initialValue), deps)
}

// Hook para memoização de ordenação
export const useMemoizedSort = (sort, data, deps) => {
  return useMemo(() => [...data].sort(sort), deps)
}

// Hook para memoização de agrupamento
export const useMemoizedGroup = (groupBy, data, deps) => {
  return useMemo(() => {
    const groups = {}
    data.forEach(item => {
      const key = groupBy(item)
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
    })
    return groups
  }, deps)
}

// Hook para memoização de busca
export const useMemoizedSearch = (search, data, deps) => {
  return useMemo(() => {
    if (!search) return data
    return data.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    )
  }, deps)
}

// Hook para memoização de paginação
export const useMemoizedPagination = (data, page, pageSize, deps) => {
  return useMemo(() => {
    const start = page * pageSize
    const end = start + pageSize
    return {
      data: data.slice(start, end),
      totalPages: Math.ceil(data.length / pageSize),
      currentPage: page,
      hasNextPage: end < data.length,
      hasPrevPage: page > 0
    }
  }, deps)
}

// Hook para memoização de cache
export const useMemoizedCache = (key, value, deps) => {
  const cache = useRef(new Map())
  
  return useMemo(() => {
    if (cache.current.has(key)) {
      return cache.current.get(key)
    }
    
    const result = value()
    cache.current.set(key, result)
    return result
  }, deps)
}

// Hook para memoização de debounce
export const useMemoizedDebounce = (value, delay, deps) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}

// Hook para memoização de throttle
export const useMemoizedThrottle = (value, delay, deps) => {
  const [throttledValue, setThrottledValue] = React.useState(value)
  const lastRun = useRef(Date.now())
  
  useEffect(() => {
    if (Date.now() - lastRun.current >= delay) {
      setThrottledValue(value)
      lastRun.current = Date.now()
    }
  }, [value, delay])
  
  return throttledValue
}

// Hook para memoização de comparação profunda
export const useMemoizedDeepCompare = (value, deps) => {
  const ref = useRef()
  
  if (!ref.current || !deepEqual(ref.current, value)) {
    ref.current = value
  }
  
  return ref.current
}

// Função para comparação profunda
const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true
  
  if (obj1 == null || obj2 == null) return false
  
  if (typeof obj1 !== typeof obj2) return false
  
  if (typeof obj1 !== 'object') return obj1 === obj2
  
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  
  if (keys1.length !== keys2.length) return false
  
  for (let key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }
  
  return true
}

// Hook para memoização de performance
export const useMemoizedPerformance = (fn, deps) => {
  const startTime = useRef()
  const endTime = useRef()
  
  const memoizedFn = useMemo(() => {
    return (...args) => {
      startTime.current = performance.now()
      const result = fn(...args)
      endTime.current = performance.now()
      
      console.log(`Function execution time: ${endTime.current - startTime.current}ms`)
      return result
    }
  }, deps)
  
  return memoizedFn
}

// Hook para memoização de cache com TTL
export const useMemoizedCacheWithTTL = (key, value, ttl, deps) => {
  const cache = useRef(new Map())
  const timestamps = useRef(new Map())
  
  return useMemo(() => {
    const now = Date.now()
    const cached = cache.current.get(key)
    const timestamp = timestamps.current.get(key)
    
    if (cached && timestamp && (now - timestamp) < ttl) {
      return cached
    }
    
    const result = value()
    cache.current.set(key, result)
    timestamps.current.set(key, now)
    
    return result
  }, deps)
}

// Hook para memoização de cache com LRU
export const useMemoizedLRUCache = (key, value, maxSize, deps) => {
  const cache = useRef(new Map())
  
  return useMemo(() => {
    if (cache.current.has(key)) {
      const result = cache.current.get(key)
      cache.current.delete(key)
      cache.current.set(key, result)
      return result
    }
    
    if (cache.current.size >= maxSize) {
      const firstKey = cache.current.keys().next().value
      cache.current.delete(firstKey)
    }
    
    const result = value()
    cache.current.set(key, result)
    
    return result
  }, deps)
}

// Hook para memoização de cache com invalidação
export const useMemoizedCacheWithInvalidation = (key, value, invalidateKeys, deps) => {
  const cache = useRef(new Map())
  
  return useMemo(() => {
    const shouldInvalidate = invalidateKeys.some(invalidateKey => 
      cache.current.has(invalidateKey)
    )
    
    if (shouldInvalidate) {
      cache.current.clear()
    }
    
    if (cache.current.has(key)) {
      return cache.current.get(key)
    }
    
    const result = value()
    cache.current.set(key, result)
    
    return result
  }, deps)
}

// Hook para memoização de cache com persistência
export const useMemoizedPersistentCache = (key, value, deps) => {
  const cache = useRef(new Map())
  
  useEffect(() => {
    const saved = localStorage.getItem(`cache_${key}`)
    if (saved) {
      try {
        cache.current.set(key, JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing cached data:', e)
      }
    }
  }, [key])
  
  return useMemo(() => {
    if (cache.current.has(key)) {
      return cache.current.get(key)
    }
    
    const result = value()
    cache.current.set(key, result)
    localStorage.setItem(`cache_${key}`, JSON.stringify(result))
    
    return result
  }, deps)
}

// Hook para memoização de cache com compressão
export const useMemoizedCompressedCache = (key, value, deps) => {
  const cache = useRef(new Map())
  
  return useMemo(() => {
    if (cache.current.has(key)) {
      return cache.current.get(key)
    }
    
    const result = value()
    const compressed = compress(JSON.stringify(result))
    cache.current.set(key, compressed)
    
    return result
  }, deps)
}

// Função para compressão simples
const compress = (str) => {
  // Implementação simples de compressão
  return btoa(str)
}

// Função para descompressão
const decompress = (str) => {
  return atob(str)
}

// Hook para memoização de cache com serialização
export const useMemoizedSerializedCache = (key, value, deps) => {
  const cache = useRef(new Map())
  
  return useMemo(() => {
    if (cache.current.has(key)) {
      return cache.current.get(key)
    }
    
    const result = value()
    const serialized = serialize(result)
    cache.current.set(key, serialized)
    
    return result
  }, deps)
}

// Função para serialização
const serialize = (obj) => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'function') {
      return value.toString()
    }
    return value
  })
}

// Função para deserialização
const deserialize = (str) => {
  return JSON.parse(str, (key, value) => {
    if (typeof value === 'string' && value.startsWith('function')) {
      return eval(`(${value})`)
    }
    return value
  })
}

// Hook para memoização de cache com versionamento
export const useMemoizedVersionedCache = (key, value, version, deps) => {
  const cache = useRef(new Map())
  const versions = useRef(new Map())
  
  return useMemo(() => {
    const currentVersion = versions.current.get(key)
    
    if (currentVersion !== version) {
      cache.current.delete(key)
      versions.current.set(key, version)
    }
    
    if (cache.current.has(key)) {
      return cache.current.get(key)
    }
    
    const result = value()
    cache.current.set(key, result)
    
    return result
  }, deps)
}

// Hook para memoização de cache com limpeza automática
export const useMemoizedAutoCleanupCache = (key, value, cleanupInterval, deps) => {
  const cache = useRef(new Map())
  const timestamps = useRef(new Map())
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      for (const [k, timestamp] of timestamps.current.entries()) {
        if (now - timestamp > cleanupInterval) {
          cache.current.delete(k)
          timestamps.current.delete(k)
        }
      }
    }, cleanupInterval)
    
    return () => clearInterval(interval)
  }, [cleanupInterval])
  
  return useMemo(() => {
    if (cache.current.has(key)) {
      timestamps.current.set(key, Date.now())
      return cache.current.get(key)
    }
    
    const result = value()
    cache.current.set(key, result)
    timestamps.current.set(key, Date.now())
    
    return result
  }, deps)
}

// Exportar tudo
export default {
  useMemoizedValue,
  useMemoizedCallback,
  useMemoizedObject,
  useMemoizedArray,
  useMemoizedComponent,
  useMemoizedCalculation,
  useMemoizedSelector,
  useMemoizedTransform,
  useMemoizedFilter,
  useMemoizedMap,
  useMemoizedReduce,
  useMemoizedSort,
  useMemoizedGroup,
  useMemoizedSearch,
  useMemoizedPagination,
  useMemoizedCache,
  useMemoizedDebounce,
  useMemoizedThrottle,
  useMemoizedDeepCompare,
  useMemoizedPerformance,
  useMemoizedCacheWithTTL,
  useMemoizedLRUCache,
  useMemoizedCacheWithInvalidation,
  useMemoizedPersistentCache,
  useMemoizedCompressedCache,
  useMemoizedSerializedCache,
  useMemoizedVersionedCache,
  useMemoizedAutoCleanupCache
}
