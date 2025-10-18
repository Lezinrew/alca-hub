// Sistema de Temas - Alça Hub Design System
import React, { createContext, useContext, useEffect, useState } from 'react'
import { designTokens } from './tokens'

// Contexto do tema
const ThemeContext = createContext()

// Hook para usar o tema
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
  }
  return context
}

// Provider do tema
export const ThemeProvider = ({ children, defaultTheme = 'light' }) => {
  const [theme, setTheme] = useState(defaultTheme)
  const [systemTheme, setSystemTheme] = useState('light')

  // Detectar tema do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Carregar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('alca-hub-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Aplicar tema ao documento
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    
    // Aplicar variáveis CSS do tema
    const themeColors = designTokens.themes[theme]?.colors || designTokens.themes.light.colors
    
    Object.entries(themeColors).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([shade, color]) => {
          root.style.setProperty(`--color-${key}-${shade}`, color)
        })
      } else {
        root.style.setProperty(`--color-${key}`, value)
      }
    })
  }, [theme])

  // Funções do tema
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('alca-hub-theme', newTheme)
  }

  const setLightTheme = () => {
    setTheme('light')
    localStorage.setItem('alca-hub-theme', 'light')
  }

  const setDarkTheme = () => {
    setTheme('dark')
    localStorage.setItem('alca-hub-theme', 'dark')
  }

  const applySystemTheme = () => {
    setTheme(systemTheme)
    localStorage.setItem('alca-hub-theme', systemTheme)
  }

  const value = {
    theme,
    systemTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    applySystemTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark',
    isSystem: theme === systemTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Componente para alternar tema
export const ThemeToggle = ({ className, ...props }) => {
  const { theme, toggleTheme, isLight } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${className || ''}`}
      aria-label={`Alternar para tema ${isLight ? 'escuro' : 'claro'}`}
      {...props}
    >
      {isLight ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  )
}

// Hook para valores do tema
export const useThemeValue = (lightValue, darkValue) => {
  const { isLight } = useTheme()
  return isLight ? lightValue : darkValue
}

// Hook para classes do tema
export const useThemeClasses = (lightClasses, darkClasses) => {
  const { isLight } = useTheme()
  return isLight ? lightClasses : darkClasses
}

// Utilitários de tema
export const themeUtils = {
  // Obter cor do tema
  getThemeColor: (color, theme) => {
    const themeColors = designTokens.themes[theme]?.colors || designTokens.themes.light.colors
    return themeColors[color] || color
  },
  
  // Obter contraste de cor
  getContrastColor: (backgroundColor) => {
    // Lógica simples para determinar cor de contraste
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  },
  
  // Obter cores do tema atual
  getCurrentThemeColors: (theme) => {
    return designTokens.themes[theme]?.colors || designTokens.themes.light.colors
  }
}

// Componente para aplicar tema
export const ThemeWrapper = ({ children, theme, className }) => {
  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  return (
    <div className={className} data-theme={theme}>
      {children}
    </div>
  )
}

// Hook para persistir tema
export const usePersistedTheme = (key = 'alca-hub-theme', defaultValue = 'light') => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key) || defaultValue
    }
    return defaultValue
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, theme)
    }
  }, [theme, key])

  return [theme, setTheme]
}

// Hook para tema do sistema
export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return systemTheme
}

// Exportar tudo
export default {
  ThemeProvider,
  useTheme,
  ThemeToggle,
  useThemeValue,
  useThemeClasses,
  themeUtils,
  ThemeWrapper,
  usePersistedTheme,
  useSystemTheme
}
