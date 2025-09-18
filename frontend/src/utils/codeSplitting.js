// Code Splitting e Route-based Loading - Alça Hub
import React, { Suspense, lazy, Component } from 'react'
import { LoadingSpinner, LazyErrorBoundary } from './lazyLoading'

// Lazy loading de páginas principais
export const LazyPages = {
  // Páginas públicas
  Home: lazy(() => import('../pages/Home')),
  Login: lazy(() => import('../pages/Login')),
  Register: lazy(() => import('../pages/Register')),
  ForgotPassword: lazy(() => import('../pages/ForgotPassword')),
  
  // Páginas do usuário
  Dashboard: lazy(() => import('../pages/Dashboard')),
  Profile: lazy(() => import('../pages/Profile')),
  Settings: lazy(() => import('../pages/Settings')),
  Bookings: lazy(() => import('../pages/Bookings')),
  Services: lazy(() => import('../pages/Services')),
  Map: lazy(() => import('../pages/Map')),
  
  // Páginas administrativas
  AdminDashboard: lazy(() => import('../pages/AdminDashboard')),
  UserManagement: lazy(() => import('../pages/UserManagement')),
  ServiceManagement: lazy(() => import('../pages/ServiceManagement')),
  BookingManagement: lazy(() => import('../pages/BookingManagement')),
  Reports: lazy(() => import('../pages/Reports')),
  
  // Páginas de erro
  NotFound: lazy(() => import('../pages/NotFound')),
  Error: lazy(() => import('../pages/Error'))
}

// Lazy loading de componentes administrativos
export const LazyAdminComponents = {
  UserManager: lazy(() => import('../components/admin/UserManager')),
  ServiceManager: lazy(() => import('../components/admin/ServiceManager')),
  BookingManager: lazy(() => import('../components/admin/BookingManager')),
  ReportGenerator: lazy(() => import('../components/admin/ReportGenerator')),
  DashboardCharts: lazy(() => import('../components/admin/DashboardCharts'))
}

// Lazy loading de componentes de UI
export const LazyUIComponents = {
  ServiceCategories: lazy(() => import('../components/ServiceCategories')),
  SideMenu: lazy(() => import('../components/SideMenu')),
  UberStyleMap: lazy(() => import('../components/UberStyleMap'))
}

// Lazy loading de utilitários
export const LazyUtils = {
  DatePicker: lazy(() => import('../components/ui/DatePicker')),
  TimePicker: lazy(() => import('../components/ui/TimePicker')),
  FileUpload: lazy(() => import('../components/ui/FileUpload')),
  ImageGallery: lazy(() => import('../components/ui/ImageGallery')),
  DataTable: lazy(() => import('../components/ui/DataTable')),
  Chart: lazy(() => import('../components/ui/Chart'))
}

// Hook para code splitting dinâmico
export const useCodeSplitting = () => {
  const [loadedModules, setLoadedModules] = React.useState(new Set())
  const [loadingModules, setLoadingModules] = React.useState(new Set())

  const loadModule = React.useCallback(async (modulePath) => {
    if (loadedModules.has(modulePath)) {
      return
    }

    if (loadingModules.has(modulePath)) {
      return
    }

    setLoadingModules(prev => new Set([...prev, modulePath]))

    try {
      const module = await import(modulePath)
      setLoadedModules(prev => new Set([...prev, modulePath]))
      return module
    } catch (error) {
      console.error(`Error loading module ${modulePath}:`, error)
      throw error
    } finally {
      setLoadingModules(prev => {
        const newSet = new Set(prev)
        newSet.delete(modulePath)
        return newSet
      })
    }
  }, [loadedModules, loadingModules])

  const preloadModule = React.useCallback(async (modulePath) => {
    if (loadedModules.has(modulePath) || loadingModules.has(modulePath)) {
      return
    }

    try {
      await import(modulePath)
      setLoadedModules(prev => new Set([...prev, modulePath]))
    } catch (error) {
      console.error(`Error preloading module ${modulePath}:`, error)
    }
  }, [loadedModules, loadingModules])

  const isModuleLoaded = React.useCallback((modulePath) => {
    return loadedModules.has(modulePath)
  }, [loadedModules])

  const isModuleLoading = React.useCallback((modulePath) => {
    return loadingModules.has(modulePath)
  }, [loadingModules])

  return {
    loadModule,
    preloadModule,
    isModuleLoaded,
    isModuleLoading,
    loadedModules: Array.from(loadedModules),
    loadingModules: Array.from(loadingModules)
  }
}

// Hook para preload de rotas
export const useRoutePreload = () => {
  const { preloadModule } = useCodeSplitting()

  const preloadRoute = React.useCallback((routePath) => {
    const moduleMap = {
      '/': () => import('../pages/Home'),
      '/login': () => import('../pages/Login'),
      '/register': () => import('../pages/Register'),
      '/dashboard': () => import('../pages/Dashboard'),
      '/profile': () => import('../pages/Profile'),
      '/settings': () => import('../pages/Settings'),
      '/bookings': () => import('../pages/Bookings'),
      '/services': () => import('../pages/Services'),
      '/map': () => import('../pages/Map'),
      '/admin': () => import('../pages/AdminDashboard'),
      '/admin/users': () => import('../pages/UserManagement'),
      '/admin/services': () => import('../pages/ServiceManagement'),
      '/admin/bookings': () => import('../pages/BookingManagement'),
      '/admin/reports': () => import('../pages/Reports')
    }

    const importFunction = moduleMap[routePath]
    if (importFunction) {
      preloadModule(importFunction)
    }
  }, [preloadModule])

  const preloadOnHover = React.useCallback((routePath) => {
    return {
      onMouseEnter: () => preloadRoute(routePath),
      onFocus: () => preloadRoute(routePath)
    }
  }, [preloadRoute])

  return { preloadRoute, preloadOnHover }
}

// Componente para lazy loading de rotas
export const LazyRoute = ({ component: Component, fallback = LoadingSpinner, ...props }) => {
  return (
    <LazyErrorBoundary>
      <Suspense fallback={<fallback />}>
        <Component {...props} />
      </Suspense>
    </LazyErrorBoundary>
  )
}

// Hook para bundle analysis
export const useBundleAnalysis = () => {
  const [bundleInfo, setBundleInfo] = React.useState(null)
  const [loading, setLoading] = React.useState(false)

  const analyzeBundle = React.useCallback(async () => {
    setLoading(true)
    try {
      // Simular análise de bundle
      const info = {
        totalSize: '2.5MB',
        gzippedSize: '800KB',
        chunks: [
          { name: 'main', size: '1.2MB', gzipped: '400KB' },
          { name: 'vendor', size: '800KB', gzipped: '250KB' },
          { name: 'admin', size: '300KB', gzipped: '100KB' },
          { name: 'ui', size: '200KB', gzipped: '50KB' }
        ],
        recommendations: [
          'Consider splitting vendor bundle',
          'Lazy load admin components',
          'Optimize image assets',
          'Remove unused dependencies'
        ]
      }
      setBundleInfo(info)
    } catch (error) {
      console.error('Error analyzing bundle:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return { bundleInfo, loading, analyzeBundle }
}

// Hook para performance monitoring
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0
  })

  const measurePerformance = React.useCallback(() => {
    const startTime = performance.now()
    
    // Medir tempo de carregamento
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, loadTime }))
    })

    // Medir uso de memória
    if (performance.memory) {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: performance.memory.usedJSHeapSize / 1024 / 1024 // MB
      }))
    }

    // Medir tamanho do bundle
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0
    scripts.forEach(script => {
      // Simular cálculo de tamanho
      totalSize += Math.random() * 1000 // KB
    })
    setMetrics(prev => ({ ...prev, bundleSize: totalSize }))
  }, [])

  React.useEffect(() => {
    measurePerformance()
  }, [measurePerformance])

  return { metrics, measurePerformance }
}

// Utilitário para criar rotas lazy
export const createLazyRoute = (importFunction, options = {}) => {
  const { fallback = LoadingSpinner, errorBoundary = true } = options
  
  const LazyComponent = lazy(importFunction)
  
  return function LazyRouteComponent(props) {
    if (errorBoundary) {
      return (
        <LazyErrorBoundary>
          <Suspense fallback={<fallback />}>
            <LazyComponent {...props} />
          </Suspense>
        </LazyErrorBoundary>
      )
    }
    
    return (
      <Suspense fallback={<fallback />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Hook para otimização de imports
export const useOptimizedImports = () => {
  const [importCache, setImportCache] = React.useState(new Map())

  const getOptimizedImport = React.useCallback((modulePath) => {
    if (importCache.has(modulePath)) {
      return importCache.get(modulePath)
    }

    const importPromise = import(modulePath)
    setImportCache(prev => new Map([...prev, [modulePath, importPromise]]))
    return importPromise
  }, [importCache])

  const clearCache = React.useCallback(() => {
    setImportCache(new Map())
  }, [])

  return { getOptimizedImport, clearCache }
}

// Componente para loading progress
export const LoadingProgress = ({ progress = 0, message = 'Carregando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-64 bg-neutral-200 rounded-full h-2 mb-4">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  )
}

// Hook para lazy loading com progress
export const useLazyLoadingWithProgress = (importFunction) => {
  const [progress, setProgress] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [Component, setComponent] = React.useState(null)
  const [error, setError] = React.useState(null)

  const loadComponent = React.useCallback(async () => {
    setLoading(true)
    setProgress(0)
    setError(null)

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const module = await importFunction()
      
      clearInterval(progressInterval)
      setProgress(100)
      
      setTimeout(() => {
        setComponent(() => module.default)
        setLoading(false)
      }, 200)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }, [importFunction])

  return { Component, loading, progress, error, loadComponent }
}

// Exportar tudo
export default {
  LazyPages,
  LazyAdminComponents,
  LazyUIComponents,
  LazyUtils,
  useCodeSplitting,
  useRoutePreload,
  LazyRoute,
  useBundleAnalysis,
  usePerformanceMonitoring,
  createLazyRoute,
  useOptimizedImports,
  LoadingProgress,
  useLazyLoadingWithProgress
}
