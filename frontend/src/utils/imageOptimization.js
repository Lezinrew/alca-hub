// Otimização de Imagens - Alça Hub
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// Hook para otimização de imagens
export const useImageOptimization = (src, options = {}) => {
  const [optimizedSrc, setOptimizedSrc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inView, setInView] = useState(false)
  const imgRef = useRef()

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    lazy = true,
    placeholder = true,
    blur = true,
    threshold = 0.1,
    rootMargin = '50px'
  } = options

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, threshold, rootMargin])

  // Gerar URL otimizada
  const generateOptimizedUrl = useCallback((originalSrc) => {
    if (!originalSrc) return null

    // Simular otimização de imagem
    const params = new URLSearchParams()
    if (width) params.append('w', width)
    if (height) params.append('h', height)
    if (quality) params.append('q', quality)
    if (format) params.append('f', format)

    const baseUrl = originalSrc.split('?')[0]
    const queryString = params.toString()
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }, [width, height, quality, format])

  // Carregar imagem otimizada
  useEffect(() => {
    if (!inView || !src) return

    setLoading(true)
    setError(null)

    const optimizedUrl = generateOptimizedUrl(src)
    
    const img = new Image()
    img.onload = () => {
      setOptimizedSrc(optimizedUrl)
      setLoading(false)
    }
    img.onerror = () => {
      setError(new Error('Failed to load optimized image'))
      setLoading(false)
    }
    img.src = optimizedUrl
  }, [inView, src, generateOptimizedUrl])

  return {
    imgRef,
    optimizedSrc,
    loading,
    error,
    inView
  }
}

// Hook para otimização de galeria de imagens
export const useImageGalleryOptimization = (images, options = {}) => {
  const [optimizedImages, setOptimizedImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'webp',
    lazy = true,
    batchSize = 5
  } = options

  // Otimizar imagens em lotes
  const optimizeImages = useCallback(async (imageList) => {
    setLoading(true)
    setError(null)

    try {
      const optimized = []
      
      for (let i = 0; i < imageList.length; i += batchSize) {
        const batch = imageList.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (image) => {
          const optimizedUrl = generateOptimizedUrl(image.src, { width, height, quality, format })
          
          return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => resolve({ ...image, optimizedSrc: optimizedUrl })
            img.onerror = () => resolve({ ...image, optimizedSrc: image.src })
            img.src = optimizedUrl
          })
        })
        
        const batchResults = await Promise.all(batchPromises)
        optimized.push(...batchResults)
      }
      
      setOptimizedImages(optimized)
      setLoading(false)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }, [width, height, quality, format, batchSize])

  const generateOptimizedUrl = useCallback((src, opts) => {
    if (!src) return null

    const params = new URLSearchParams()
    if (opts.width) params.append('w', opts.width)
    if (opts.height) params.append('h', opts.height)
    if (opts.quality) params.append('q', opts.quality)
    if (opts.format) params.append('f', opts.format)

    const baseUrl = src.split('?')[0]
    const queryString = params.toString()
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }, [])

  useEffect(() => {
    if (images.length > 0) {
      optimizeImages(images)
    }
  }, [images, optimizeImages])

  return {
    optimizedImages,
    loading,
    error,
    optimizeImages
  }
}

// Hook para otimização de imagens responsivas
export const useResponsiveImageOptimization = (src, breakpoints = {}) => {
  const [optimizedSrc, setOptimizedSrc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentBreakpoint, setCurrentBreakpoint] = useState('default')

  const defaultBreakpoints = {
    xs: { width: 320, height: 240, quality: 60 },
    sm: { width: 640, height: 480, quality: 70 },
    md: { width: 768, height: 576, quality: 80 },
    lg: { width: 1024, height: 768, quality: 85 },
    xl: { width: 1280, height: 960, quality: 90 },
    default: { width: 800, height: 600, quality: 80 }
  }

  const mergedBreakpoints = { ...defaultBreakpoints, ...breakpoints }

  // Detectar breakpoint atual
  useEffect(() => {
    const detectBreakpoint = () => {
      const width = window.innerWidth
      
      if (width >= 1280) setCurrentBreakpoint('xl')
      else if (width >= 1024) setCurrentBreakpoint('lg')
      else if (width >= 768) setCurrentBreakpoint('md')
      else if (width >= 640) setCurrentBreakpoint('sm')
      else setCurrentBreakpoint('xs')
    }

    detectBreakpoint()
    window.addEventListener('resize', detectBreakpoint)
    return () => window.removeEventListener('resize', detectBreakpoint)
  }, [])

  // Gerar URL otimizada para breakpoint atual
  useEffect(() => {
    if (!src) return

    setLoading(true)
    setError(null)

    const breakpoint = mergedBreakpoints[currentBreakpoint]
    const params = new URLSearchParams()
    params.append('w', breakpoint.width)
    params.append('h', breakpoint.height)
    params.append('q', breakpoint.quality)
    params.append('f', 'webp')

    const baseUrl = src.split('?')[0]
    const optimizedUrl = `${baseUrl}?${params.toString()}`

    const img = new Image()
    img.onload = () => {
      setOptimizedSrc(optimizedUrl)
      setLoading(false)
    }
    img.onerror = () => {
      setError(new Error('Failed to load responsive image'))
      setLoading(false)
    }
    img.src = optimizedUrl
  }, [src, currentBreakpoint, mergedBreakpoints])

  return {
    optimizedSrc,
    loading,
    error,
    currentBreakpoint
  }
}

// Hook para otimização de imagens com cache
export const useImageCache = () => {
  const [cache, setCache] = useState(new Map())
  const [loading, setLoading] = useState(false)

  const getCachedImage = useCallback((src) => {
    return cache.get(src)
  }, [cache])

  const setCachedImage = useCallback((src, optimizedSrc) => {
    setCache(prev => new Map([...prev, [src, optimizedSrc]]))
  }, [])

  const clearCache = useCallback(() => {
    setCache(new Map())
  }, [])

  const optimizeWithCache = useCallback(async (src, options = {}) => {
    const cached = getCachedImage(src)
    if (cached) return cached

    setLoading(true)
    
    try {
      const optimizedUrl = await generateOptimizedUrl(src, options)
      setCachedImage(src, optimizedUrl)
      return optimizedUrl
    } catch (error) {
      console.error('Error optimizing image:', error)
      return src
    } finally {
      setLoading(false)
    }
  }, [getCachedImage, setCachedImage])

  const generateOptimizedUrl = useCallback(async (src, options) => {
    const params = new URLSearchParams()
    if (options.width) params.append('w', options.width)
    if (options.height) params.append('h', options.height)
    if (options.quality) params.append('q', options.quality)
    if (options.format) params.append('f', options.format)

    const baseUrl = src.split('?')[0]
    const queryString = params.toString()
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }, [])

  return {
    cache: Array.from(cache.entries()),
    loading,
    getCachedImage,
    setCachedImage,
    clearCache,
    optimizeWithCache
  }
}

// Hook para otimização de imagens com compressão
export const useImageCompression = () => {
  const [compressionStats, setCompressionStats] = useState({
    originalSize: 0,
    compressedSize: 0,
    compressionRatio: 0,
    savings: 0
  })

  const compressImage = useCallback(async (file, options = {}) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'image/jpeg'
    } = options

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calcular novas dimensões
        let { width, height } = img
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        
        if (ratio < 1) {
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height)

        // Comprimir
        canvas.toBlob((blob) => {
          const originalSize = file.size
          const compressedSize = blob.size
          const compressionRatio = (1 - compressedSize / originalSize) * 100
          const savings = originalSize - compressedSize

          setCompressionStats({
            originalSize,
            compressedSize,
            compressionRatio,
            savings
          })

          resolve(blob)
        }, format, quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }, [])

  return {
    compressionStats,
    compressImage
  }
}

// Hook para otimização de imagens com WebP
export const useWebPOptimization = () => {
  const [webpSupported, setWebpSupported] = useState(false)
  const [loading, setLoading] = useState(false)

  // Verificar suporte ao WebP
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }

    setWebpSupported(checkWebPSupport())
  }, [])

  const convertToWebP = useCallback(async (file) => {
    if (!webpSupported) return file

    setLoading(true)
    
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          canvas.toBlob((blob) => {
            resolve(blob)
            setLoading(false)
          }, 'image/webp', 0.8)
        }

        img.src = URL.createObjectURL(file)
      })
    } catch (error) {
      console.error('Error converting to WebP:', error)
      setLoading(false)
      return file
    }
  }, [webpSupported])

  return {
    webpSupported,
    loading,
    convertToWebP
  }
}

// Hook para otimização de imagens com lazy loading
export const useLazyImageOptimization = (src, options = {}) => {
  const [optimizedSrc, setOptimizedSrc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inView, setInView] = useState(false)
  const imgRef = useRef()

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    threshold = 0.1,
    rootMargin = '50px',
    placeholder = true,
    blur = true
  } = options

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  // Carregar imagem otimizada
  useEffect(() => {
    if (!inView || !src) return

    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (width) params.append('w', width)
    if (height) params.append('h', height)
    params.append('q', quality)
    params.append('f', format)

    const baseUrl = src.split('?')[0]
    const optimizedUrl = `${baseUrl}?${params.toString()}`

    const img = new Image()
    img.onload = () => {
      setOptimizedSrc(optimizedUrl)
      setLoading(false)
    }
    img.onerror = () => {
      setError(new Error('Failed to load optimized image'))
      setLoading(false)
    }
    img.src = optimizedUrl
  }, [inView, src, width, height, quality, format])

  return {
    imgRef,
    optimizedSrc,
    loading,
    error,
    inView
  }
}

// Hook para otimização de imagens com preload
export const useImagePreload = () => {
  const [preloadedImages, setPreloadedImages] = useState(new Set())
  const [loading, setLoading] = useState(false)

  const preloadImage = useCallback(async (src) => {
    if (preloadedImages.has(src)) return

    setLoading(true)
    
    try {
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = src
      })
      
      setPreloadedImages(prev => new Set([...prev, src]))
    } catch (error) {
      console.error('Error preloading image:', error)
    } finally {
      setLoading(false)
    }
  }, [preloadedImages])

  const preloadImages = useCallback(async (srcs) => {
    setLoading(true)
    
    try {
      await Promise.all(srcs.map(src => preloadImage(src)))
    } finally {
      setLoading(false)
    }
  }, [preloadImage])

  const clearPreloaded = useCallback(() => {
    setPreloadedImages(new Set())
  }, [])

  return {
    preloadedImages: Array.from(preloadedImages),
    loading,
    preloadImage,
    preloadImages,
    clearPreloaded
  }
}

// Hook para otimização de imagens com análise
export const useImageAnalysis = () => {
  const [analysis, setAnalysis] = useState({
    totalImages: 0,
    totalSize: 0,
    optimizedSize: 0,
    savings: 0,
    recommendations: []
  })

  const analyzeImages = useCallback((images) => {
    const totalImages = images.length
    const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0)
    const optimizedSize = totalSize * 0.6 // Simular 40% de redução
    const savings = totalSize - optimizedSize

    const recommendations = []
    
    if (totalSize > 5 * 1024 * 1024) { // 5MB
      recommendations.push('Consider lazy loading for large images')
    }
    
    if (images.some(img => img.size > 1024 * 1024)) { // 1MB
      recommendations.push('Compress large images')
    }
    
    if (images.some(img => !img.format || img.format === 'png')) {
      recommendations.push('Convert PNG to WebP for better compression')
    }

    setAnalysis({
      totalImages,
      totalSize,
      optimizedSize,
      savings,
      recommendations
    })
  }, [])

  return { analysis, analyzeImages }
}

// Exportar tudo
export default {
  useImageOptimization,
  useImageGalleryOptimization,
  useResponsiveImageOptimization,
  useImageCache,
  useImageCompression,
  useWebPOptimization,
  useLazyImageOptimization,
  useImagePreload,
  useImageAnalysis
}
