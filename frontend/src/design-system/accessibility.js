// Sistema de Acessibilidade - Alça Hub Design System
import React, { useEffect, useRef, useState } from 'react'
import { designTokens } from './tokens'

// Hook para gerenciar foco
export const useFocusManagement = () => {
  const focusableElements = useRef([])
  const currentIndex = useRef(-1)

  const getFocusableElements = (container) => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
  }

  const trapFocus = (container) => {
    const elements = getFocusableElements(container)
    focusableElements.current = elements

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        
        if (e.shiftKey) {
          currentIndex.current = currentIndex.current > 0 
            ? currentIndex.current - 1 
            : elements.length - 1
        } else {
          currentIndex.current = currentIndex.current < elements.length - 1 
            ? currentIndex.current + 1 
            : 0
        }
        
        elements[currentIndex.current]?.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }

  const focusFirst = () => {
    if (focusableElements.current.length > 0) {
      focusableElements.current[0].focus()
      currentIndex.current = 0
    }
  }

  const focusLast = () => {
    if (focusableElements.current.length > 0) {
      const lastIndex = focusableElements.current.length - 1
      focusableElements.current[lastIndex].focus()
      currentIndex.current = lastIndex
    }
  }

  return { trapFocus, focusFirst, focusLast }
}

// Hook para gerenciar ARIA
export const useAria = () => {
  const [ariaLive, setAriaLive] = useState('polite')
  const [announcements, setAnnouncements] = useState([])

  const announce = (message, priority = 'polite') => {
    setAriaLive(priority)
    setAnnouncements(prev => [...prev, { message, id: Date.now() }])
    
    // Limpar anúncio após 5 segundos
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1))
    }, 5000)
  }

  const announceError = (message) => announce(message, 'assertive')
  const announceSuccess = (message) => announce(message, 'polite')
  const announceInfo = (message) => announce(message, 'polite')

  return {
    ariaLive,
    announcements,
    announce,
    announceError,
    announceSuccess,
    announceInfo
  }
}

// Hook para gerenciar teclado
export const useKeyboard = () => {
  const [pressedKeys, setPressedKeys] = useState(new Set())

  useEffect(() => {
    const handleKeyDown = (e) => {
      setPressedKeys(prev => new Set([...prev, e.key]))
    }

    const handleKeyUp = (e) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(e.key)
        return newSet
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const isPressed = (key) => pressedKeys.has(key)
  const isCombination = (keys) => keys.every(key => pressedKeys.has(key))

  return { pressedKeys, isPressed, isCombination }
}

// Hook para gerenciar contraste
export const useContrast = () => {
  const [contrastRatio, setContrastRatio] = useState(1)

  const calculateContrast = (color1, color2) => {
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g).map(Number)
      const [r, g, b] = rgb.map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  const checkContrast = (foreground, background) => {
    const ratio = calculateContrast(foreground, background)
    setContrastRatio(ratio)
    return ratio
  }

  const isAccessible = (ratio = contrastRatio) => {
    return ratio >= 4.5 // WCAG AA
  }

  const isHighContrast = (ratio = contrastRatio) => {
    return ratio >= 7 // WCAG AAA
  }

  return { contrastRatio, checkContrast, isAccessible, isHighContrast }
}

// Hook para gerenciar movimento
export const useMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const shouldAnimate = (animation) => {
    if (prefersReducedMotion) {
      return animation === 'none' || animation === 'fade'
    }
    return true
  }

  return { prefersReducedMotion, shouldAnimate }
}

// Hook para gerenciar zoom
export const useZoom = () => {
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    const updateZoom = () => {
      const zoom = window.devicePixelRatio || 1
      setZoomLevel(zoom)
    }

    updateZoom()
    window.addEventListener('resize', updateZoom)
    return () => window.removeEventListener('resize', updateZoom)
  }, [])

  const isZoomed = zoomLevel > 1.5
  const isHighZoom = zoomLevel > 2

  return { zoomLevel, isZoomed, isHighZoom }
}

// Componente para anúncios de tela
export const ScreenReaderAnnouncements = () => {
  const { announcements } = useAria()

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcements.map(({ message, id }) => (
        <div key={id}>{message}</div>
      ))}
    </div>
  )
}

// Componente para pular para conteúdo
export const SkipLink = ({ href = '#main-content', children = 'Pular para conteúdo' }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-md focus:shadow-lg"
    >
      {children}
    </a>
  )
}

// Hook para gerenciar foco visível
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsFocusVisible(true)
      }
    }

    const handleMouseDown = () => {
      setIsFocusVisible(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return isFocusVisible
}

// Utilitários de acessibilidade
export const accessibilityUtils = {
  // Gerar ID único
  generateId: (prefix = 'id') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Verificar se elemento é focado
  isFocused: (element) => document.activeElement === element,
  
  // Verificar se elemento é visível
  isVisible: (element) => {
    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  },
  
  // Verificar se elemento está na viewport
  isInViewport: (element) => {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  },
  
  // Obter texto alternativo
  getAltText: (element) => {
    const alt = element.getAttribute('alt')
    const ariaLabel = element.getAttribute('aria-label')
    const ariaLabelledby = element.getAttribute('aria-labelledby')
    
    if (alt) return alt
    if (ariaLabel) return ariaLabel
    if (ariaLabelledby) {
      const labelElement = document.getElementById(ariaLabelledby)
      return labelElement ? labelElement.textContent : ''
    }
    
    return ''
  },
  
  // Verificar se cor é acessível
  isColorAccessible: (foreground, background) => {
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g).map(Number)
      const [r, g, b] = rgb.map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    
    const lum1 = getLuminance(foreground)
    const lum2 = getLuminance(background)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    const ratio = (brightest + 0.05) / (darkest + 0.05)
    
    return ratio >= 4.5
  }
}

// Hook para gerenciar acessibilidade completa
export const useAccessibility = () => {
  const focus = useFocusManagement()
  const aria = useAria()
  const keyboard = useKeyboard()
  const contrast = useContrast()
  const motion = useMotion()
  const zoom = useZoom()
  const focusVisible = useFocusVisible()

  return {
    focus,
    aria,
    keyboard,
    contrast,
    motion,
    zoom,
    focusVisible,
    utils: accessibilityUtils
  }
}

// Exportar tudo
export default {
  useFocusManagement,
  useAria,
  useKeyboard,
  useContrast,
  useMotion,
  useZoom,
  useFocusVisible,
  useAccessibility,
  ScreenReaderAnnouncements,
  SkipLink,
  accessibilityUtils
}
