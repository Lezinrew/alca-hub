// Utilitários de Lazy Loading - Alça Hub
import React, { Suspense, lazy, Component } from 'react'
import { motion } from 'framer-motion'

// Componente de Loading personalizado
const LoadingSpinner = ({ size = 'md', message = 'Carregando...' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className={`${sizes[size]} border-4 border-primary-200 border-t-primary-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="mt-4 text-sm text-neutral-500">{message}</p>
    </div>
  )
}

// Componente de Error Boundary para lazy loading
class LazyErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy Loading Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 mb-4 text-error-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Erro ao carregar componente
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            Ocorreu um erro ao carregar este componente. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            Recarregar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para lazy loading com retry
export const useLazyComponent = (importFunction, retries = 3) => {
  const [Component, setComponent] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [retryCount, setRetryCount] = React.useState(0)

  const loadComponent = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const module = await importFunction()
      setComponent(() => module.default)
      setLoading(false)
    } catch (err) {
      console.error('Error loading component:', err)
      setError(err)
      
      if (retryCount < retries) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => loadComponent(), 1000 * (retryCount + 1))
      } else {
        setLoading(false)
      }
    }
  }, [importFunction, retries, retryCount])

  React.useEffect(() => {
    loadComponent()
  }, [loadComponent])

  return { Component, loading, error, retry: loadComponent }
}

// HOC para lazy loading com suspense
export const withLazyLoading = (WrappedComponent, LoadingComponent = LoadingSpinner) => {
  return function LazyWrapper(props) {
    return (
      <LazyErrorBoundary>
        <Suspense fallback={<LoadingComponent />}>
          <WrappedComponent {...props} />
        </Suspense>
      </LazyErrorBoundary>
    )
  }
}

// Hook para lazy loading de imagens
export const useLazyImage = (src, options = {}) => {
  const [imageSrc, setImageSrc] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [inView, setInView] = React.useState(false)
  const imgRef = React.useRef()

  const { threshold = 0.1, rootMargin = '50px' } = options

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (inView && src) {
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
        setLoading(false)
      }
      img.onerror = () => {
        setError(new Error('Failed to load image'))
        setLoading(false)
      }
      img.src = src
    }
  }, [inView, src])

  return { imgRef, imageSrc, loading, error }
}

// Componente de imagem lazy
export const LazyImage = ({ src, alt, className, placeholder, ...props }) => {
  const { imgRef, imageSrc, loading, error } = useLazyImage(src)

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 ${className}`}>
        <span className="text-neutral-400">Erro ao carregar imagem</span>
      </div>
    )
  }

  return (
    <div ref={imgRef} className={className}>
      {loading ? (
        placeholder || (
          <div className="flex items-center justify-center bg-neutral-100 h-full">
            <LoadingSpinner size="sm" message="Carregando imagem..." />
          </div>
        )
      ) : (
        <img src={imageSrc} alt={alt} {...props} />
      )}
    </div>
  )
}

// Hook para lazy loading de dados
export const useLazyData = (fetchFunction, dependencies = []) => {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction()
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Hook para lazy loading de módulos
export const useLazyModule = (modulePath, retries = 3) => {
  const [module, setModule] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [retryCount, setRetryCount] = React.useState(0)

  const loadModule = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const module = await import(modulePath)
      setModule(module)
      setLoading(false)
    } catch (err) {
      console.error('Error loading module:', err)
      setError(err)
      
      if (retryCount < retries) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => loadModule(), 1000 * (retryCount + 1))
      } else {
        setLoading(false)
      }
    }
  }, [modulePath, retries, retryCount])

  React.useEffect(() => {
    loadModule()
  }, [loadModule])

  return { module, loading, error, retry: loadModule }
}

// Utilitário para criar lazy components
export const createLazyComponent = (importFunction, options = {}) => {
  const { fallback = LoadingSpinner, errorBoundary = true } = options
  
  const LazyComponent = lazy(importFunction)
  
  if (errorBoundary) {
    return withLazyLoading(LazyComponent, fallback)
  }
  
  return (props) => (
    <Suspense fallback={<fallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// Hook para preload de componentes
export const usePreload = () => {
  const preloadedComponents = React.useRef(new Set())

  const preload = React.useCallback((importFunction) => {
    if (preloadedComponents.current.has(importFunction)) {
      return Promise.resolve()
    }

    return importFunction().then((module) => {
      preloadedComponents.current.add(importFunction)
      return module
    })
  }, [])

  const preloadOnHover = React.useCallback((importFunction) => {
    return {
      onMouseEnter: () => preload(importFunction),
      onFocus: () => preload(importFunction)
    }
  }, [preload])

  return { preload, preloadOnHover }
}

// Hook para lazy loading com intersection observer
export const useLazyIntersection = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const [hasIntersected, setHasIntersected] = React.useState(false)
  const ref = React.useRef()

  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin, hasIntersected])

  return { ref, isIntersecting, hasIntersected }
}

// Componente wrapper para lazy loading
export const LazyWrapper = ({ children, fallback = LoadingSpinner, errorBoundary = true }) => {
  if (errorBoundary) {
    return (
      <LazyErrorBoundary>
        <Suspense fallback={<fallback />}>
          {children}
        </Suspense>
      </LazyErrorBoundary>
    )
  }

  return (
    <Suspense fallback={<fallback />}>
      {children}
    </Suspense>
  )
}

// Exportar tudo
export default {
  LoadingSpinner,
  LazyErrorBoundary,
  useLazyComponent,
  withLazyLoading,
  useLazyImage,
  LazyImage,
  useLazyData,
  useLazyModule,
  createLazyComponent,
  usePreload,
  useLazyIntersection,
  LazyWrapper
}
