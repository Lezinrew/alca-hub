// Testes de Performance - Alça Hub
import React, { useState, useEffect, useRef, useCallback } from 'react'

// Hook para medição de performance
export const usePerformanceMeasurement = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    fps: 0,
    interactions: 0
  })

  const [isMeasuring, setIsMeasuring] = useState(false)
  const startTime = useRef(0)
  const frameCount = useRef(0)
  const lastFrameTime = useRef(0)

  const startMeasurement = useCallback(() => {
    setIsMeasuring(true)
    startTime.current = performance.now()
    frameCount.current = 0
    lastFrameTime.current = performance.now()
  }, [])

  const stopMeasurement = useCallback(() => {
    setIsMeasuring(false)
    const endTime = performance.now()
    const loadTime = endTime - startTime.current
    
    setMetrics(prev => ({
      ...prev,
      loadTime,
      memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0
    }))
  }, [])

  const measureRenderTime = useCallback((componentName) => {
    const start = performance.now()
    
    return () => {
      const end = performance.now()
      const renderTime = end - start
      
      setMetrics(prev => ({
        ...prev,
        renderTime: prev.renderTime + renderTime
      }))
      
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`)
    }
  }, [])

  const measureFPS = useCallback(() => {
    if (!isMeasuring) return

    const now = performance.now()
    frameCount.current++
    
    if (now - lastFrameTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastFrameTime.current))
      setMetrics(prev => ({ ...prev, fps }))
      frameCount.current = 0
      lastFrameTime.current = now
    }

    requestAnimationFrame(measureFPS)
  }, [isMeasuring])

  const recordInteraction = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      interactions: prev.interactions + 1
    }))
  }, [])

  useEffect(() => {
    if (isMeasuring) {
      measureFPS()
    }
  }, [isMeasuring, measureFPS])

  return {
    metrics,
    isMeasuring,
    startMeasurement,
    stopMeasurement,
    measureRenderTime,
    recordInteraction
  }
}

// Hook para teste de performance de componentes
export const useComponentPerformanceTest = (Component, props, iterations = 100) => {
  const [results, setResults] = useState({
    averageRenderTime: 0,
    minRenderTime: Infinity,
    maxRenderTime: 0,
    totalRenderTime: 0,
    iterations: 0
  })

  const [isRunning, setIsRunning] = useState(false)

  const runTest = useCallback(async () => {
    setIsRunning(true)
    const renderTimes = []

    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      
      // Simular renderização do componente
      const element = React.createElement(Component, props)
      React.createElement('div', null, element)
      
      const end = performance.now()
      const renderTime = end - start
      renderTimes.push(renderTime)
    }

    const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
    const minRenderTime = Math.min(...renderTimes)
    const maxRenderTime = Math.max(...renderTimes)
    const totalRenderTime = renderTimes.reduce((sum, time) => sum + time, 0)

    setResults({
      averageRenderTime,
      minRenderTime,
      maxRenderTime,
      totalRenderTime,
      iterations
    })

    setIsRunning(false)
  }, [Component, props, iterations])

  return {
    results,
    isRunning,
    runTest
  }
}

// Hook para teste de performance de listas
export const useListPerformanceTest = (items, itemHeight, containerHeight) => {
  const [results, setResults] = useState({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
    scrollPerformance: 0
  })

  const [isRunning, setIsRunning] = useState(false)

  const runTest = useCallback(async () => {
    setIsRunning(true)
    
    // Teste de renderização
    const startRender = performance.now()
    const listElement = document.createElement('div')
    listElement.style.height = `${containerHeight}px`
    listElement.style.overflow = 'auto'
    
    for (let i = 0; i < items.length; i++) {
      const item = document.createElement('div')
      item.style.height = `${itemHeight}px`
      item.textContent = `Item ${i}`
      listElement.appendChild(item)
    }
    
    document.body.appendChild(listElement)
    const endRender = performance.now()
    const renderTime = endRender - startRender

    // Teste de scroll
    const startScroll = performance.now()
    listElement.scrollTop = listElement.scrollHeight
    const endScroll = performance.now()
    const scrollPerformance = endScroll - startScroll

    // Limpeza
    document.body.removeChild(listElement)

    setResults({
      renderTime,
      memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0,
      fps: 0, // Será calculado separadamente
      scrollPerformance
    })

    setIsRunning(false)
  }, [items, itemHeight, containerHeight])

  return {
    results,
    isRunning,
    runTest
  }
}

// Hook para teste de performance de imagens
export const useImagePerformanceTest = (images, options = {}) => {
  const [results, setResults] = useState({
    loadTime: 0,
    memoryUsage: 0,
    compressionRatio: 0,
    optimizationSavings: 0
  })

  const [isRunning, setIsRunning] = useState(false)

  const runTest = useCallback(async () => {
    setIsRunning(true)
    
    const startTime = performance.now()
    const loadedImages = []

    // Carregar imagens
    for (const image of images) {
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = image.src
      })
      loadedImages.push(img)
    }

    const endTime = performance.now()
    const loadTime = endTime - startTime

    // Calcular uso de memória
    const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0

    // Calcular compressão
    const originalSize = images.reduce((sum, img) => sum + (img.size || 0), 0)
    const compressedSize = originalSize * 0.6 // Simular 40% de redução
    const compressionRatio = (1 - compressedSize / originalSize) * 100
    const optimizationSavings = originalSize - compressedSize

    setResults({
      loadTime,
      memoryUsage,
      compressionRatio,
      optimizationSavings
    })

    setIsRunning(false)
  }, [images])

  return {
    results,
    isRunning,
    runTest
  }
}

// Hook para teste de performance de cache
export const useCachePerformanceTest = (cache, operations = 1000) => {
  const [results, setResults] = useState({
    averageGetTime: 0,
    averageSetTime: 0,
    hitRate: 0,
    memoryUsage: 0
  })

  const [isRunning, setIsRunning] = useState(false)

  const runTest = useCallback(async () => {
    setIsRunning(true)
    
    const getTimes = []
    const setTimes = []
    let hits = 0
    let misses = 0

    // Teste de operações
    for (let i = 0; i < operations; i++) {
      const key = `test_key_${i}`
      const value = `test_value_${i}`

      // Teste de set
      const startSet = performance.now()
      cache.set(key, value)
      const endSet = performance.now()
      setTimes.push(endSet - startSet)

      // Teste de get
      const startGet = performance.now()
      const result = cache.get(key)
      const endGet = performance.now()
      getTimes.push(endGet - startGet)

      if (result) {
        hits++
      } else {
        misses++
      }
    }

    const averageGetTime = getTimes.reduce((sum, time) => sum + time, 0) / getTimes.length
    const averageSetTime = setTimes.reduce((sum, time) => sum + time, 0) / setTimes.length
    const hitRate = (hits / (hits + misses)) * 100
    const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0

    setResults({
      averageGetTime,
      averageSetTime,
      hitRate,
      memoryUsage
    })

    setIsRunning(false)
  }, [cache, operations])

  return {
    results,
    isRunning,
    runTest
  }
}

// Hook para teste de performance de bundle
export const useBundlePerformanceTest = () => {
  const [results, setResults] = useState({
    totalSize: 0,
    gzippedSize: 0,
    compressionRatio: 0,
    loadTime: 0,
    parseTime: 0
  })

  const [isRunning, setIsRunning] = useState(false)

  const runTest = useCallback(async () => {
    setIsRunning(true)
    
    const startTime = performance.now()
    
    // Simular análise de bundle
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0
    let gzippedSize = 0

    for (const script of scripts) {
      try {
        const response = await fetch(script.src, { method: 'HEAD' })
        const contentLength = response.headers.get('content-length')
        if (contentLength) {
          totalSize += parseInt(contentLength)
        }
      } catch (error) {
        console.warn('Could not fetch script size:', error)
      }
    }

    // Simular gzip
    gzippedSize = totalSize * 0.3 // 70% de redução com gzip
    const compressionRatio = (1 - gzippedSize / totalSize) * 100

    const endTime = performance.now()
    const loadTime = endTime - startTime

    // Simular tempo de parse
    const parseTime = totalSize * 0.001 // 1ms por KB

    setResults({
      totalSize,
      gzippedSize,
      compressionRatio,
      loadTime,
      parseTime
    })

    setIsRunning(false)
  }, [])

  return {
    results,
    isRunning,
    runTest
  }
}

// Hook para teste de performance de rede
export const useNetworkPerformanceTest = (urls) => {
  const [results, setResults] = useState({
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    successRate: 0,
    totalRequests: 0
  })

  const [isRunning, setIsRunning] = useState(false)

  const runTest = useCallback(async () => {
    setIsRunning(true)
    
    const responseTimes = []
    let successCount = 0

    for (const url of urls) {
      try {
        const startTime = performance.now()
        const response = await fetch(url)
        const endTime = performance.now()
        
        if (response.ok) {
          successCount++
        }
        
        responseTimes.push(endTime - startTime)
      } catch (error) {
        console.warn('Request failed:', error)
      }
    }

    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const minResponseTime = Math.min(...responseTimes)
    const maxResponseTime = Math.max(...responseTimes)
    const successRate = (successCount / urls.length) * 100

    setResults({
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      successRate,
      totalRequests: urls.length
    })

    setIsRunning(false)
  }, [urls])

  return {
    results,
    isRunning,
    runTest
  }
}

// Hook para teste de performance de animações
export const useAnimationPerformanceTest = (animations, duration = 1000) => {
  const [results, setResults] = useState({
    averageFPS: 0,
    minFPS: Infinity,
    maxFPS: 0,
    frameDrops: 0,
    smoothness: 0
  })

  const [isRunning, setIsRunning] = useState(false)

  const runTest = useCallback(async () => {
    setIsRunning(true)
    
    const fpsValues = []
    let frameCount = 0
    let lastTime = performance.now()
    let frameDrops = 0

    const measureFrame = (currentTime) => {
      frameCount++
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        fpsValues.push(fps)
        
        if (fps < 30) {
          frameDrops++
        }
        
        frameCount = 0
        lastTime = currentTime
      }
      
      if (currentTime - startTime < duration) {
        requestAnimationFrame(measureFrame)
      } else {
        const averageFPS = fpsValues.reduce((sum, fps) => sum + fps, 0) / fpsValues.length
        const minFPS = Math.min(...fpsValues)
        const maxFPS = Math.max(...fpsValues)
        const smoothness = (1 - frameDrops / fpsValues.length) * 100

        setResults({
          averageFPS,
          minFPS,
          maxFPS,
          frameDrops,
          smoothness
        })

        setIsRunning(false)
      }
    }

    const startTime = performance.now()
    requestAnimationFrame(measureFrame)
  }, [animations, duration])

  return {
    results,
    isRunning,
    runTest
  }
}

// Hook para teste de performance geral
export const useGeneralPerformanceTest = () => {
  const [results, setResults] = useState({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    totalBlockingTime: 0
  })

  const [isRunning, setIsRunning] = useState(false)

  const runTest = useCallback(async () => {
    setIsRunning(true)
    
    // Usar Performance Observer para métricas reais
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            setResults(prev => ({
              ...prev,
              loadTime: entry.loadEventEnd - entry.loadEventStart
            }))
          }
          
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              setResults(prev => ({
                ...prev,
                firstContentfulPaint: entry.startTime
              }))
            }
          }
          
          if (entry.entryType === 'largest-contentful-paint') {
            setResults(prev => ({
              ...prev,
              largestContentfulPaint: entry.startTime
            }))
          }
        })
      })

      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
    }

    setIsRunning(false)
  }, [])

  return {
    results,
    isRunning,
    runTest
  }
}

// Hook para relatório de performance
export const usePerformanceReport = () => {
  const [report, setReport] = useState({
    score: 0,
    recommendations: [],
    metrics: {},
    timestamp: new Date().toISOString()
  })

  const generateReport = useCallback((allResults) => {
    const score = calculatePerformanceScore(allResults)
    const recommendations = generateRecommendations(allResults)
    
    setReport({
      score,
      recommendations,
      metrics: allResults,
      timestamp: new Date().toISOString()
    })
  }, [])

  const calculatePerformanceScore = (results) => {
    let score = 100
    
    // Penalizar por tempo de carregamento alto
    if (results.loadTime > 3000) score -= 20
    if (results.loadTime > 5000) score -= 30
    
    // Penalizar por FPS baixo
    if (results.fps < 30) score -= 25
    if (results.fps < 15) score -= 40
    
    // Penalizar por uso de memória alto
    if (results.memoryUsage > 100) score -= 15
    if (results.memoryUsage > 200) score -= 25
    
    return Math.max(0, score)
  }

  const generateRecommendations = (results) => {
    const recommendations = []
    
    if (results.loadTime > 3000) {
      recommendations.push('Otimize o tempo de carregamento com lazy loading e code splitting')
    }
    
    if (results.fps < 30) {
      recommendations.push('Melhore a performance de renderização com memoização e virtualização')
    }
    
    if (results.memoryUsage > 100) {
      recommendations.push('Reduza o uso de memória com limpeza de cache e otimização de imagens')
    }
    
    if (results.bundleSize > 2000000) {
      recommendations.push('Reduza o tamanho do bundle com tree shaking e compressão')
    }
    
    return recommendations
  }

  return {
    report,
    generateReport
  }
}

// Exportar tudo
export default {
  usePerformanceMeasurement,
  useComponentPerformanceTest,
  useListPerformanceTest,
  useImagePerformanceTest,
  useCachePerformanceTest,
  useBundlePerformanceTest,
  useNetworkPerformanceTest,
  useAnimationPerformanceTest,
  useGeneralPerformanceTest,
  usePerformanceReport
}
