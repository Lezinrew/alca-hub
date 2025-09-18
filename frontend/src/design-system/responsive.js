// Sistema Responsivo - Alça Hub Design System
import { designTokens } from './tokens'

// Breakpoints
export const breakpoints = designTokens.breakpoints

// Media queries
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`
}

// Hook para detectar breakpoint
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState('xs')
  
  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width >= parseInt(breakpoints['2xl'])) {
        setBreakpoint('2xl')
      } else if (width >= parseInt(breakpoints.xl)) {
        setBreakpoint('xl')
      } else if (width >= parseInt(breakpoints.lg)) {
        setBreakpoint('lg')
      } else if (width >= parseInt(breakpoints.md)) {
        setBreakpoint('md')
      } else if (width >= parseInt(breakpoints.sm)) {
        setBreakpoint('sm')
      } else {
        setBreakpoint('xs')
      }
    }
    
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])
  
  return breakpoint
}

// Hook para detectar se é mobile
export const useIsMobile = () => {
  const breakpoint = useBreakpoint()
  return breakpoint === 'xs' || breakpoint === 'sm'
}

// Hook para detectar se é tablet
export const useIsTablet = () => {
  const breakpoint = useBreakpoint()
  return breakpoint === 'md'
}

// Hook para detectar se é desktop
export const useIsDesktop = () => {
  const breakpoint = useBreakpoint()
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl'
}

// Utilitários responsivos
export const responsive = {
  // Grid responsivo
  grid: {
    xs: 'grid-cols-1',
    sm: 'sm:grid-cols-2',
    md: 'md:grid-cols-3',
    lg: 'lg:grid-cols-4',
    xl: 'xl:grid-cols-5',
    '2xl': '2xl:grid-cols-6'
  },
  
  // Flexbox responsivo
  flex: {
    xs: 'flex-col',
    sm: 'sm:flex-row',
    md: 'md:flex-row',
    lg: 'lg:flex-row',
    xl: 'xl:flex-row'
  },
  
  // Espaçamento responsivo
  spacing: {
    xs: 'p-2',
    sm: 'sm:p-4',
    md: 'md:p-6',
    lg: 'lg:p-8',
    xl: 'xl:p-10'
  },
  
  // Tamanho de texto responsivo
  text: {
    xs: 'text-sm',
    sm: 'sm:text-base',
    md: 'md:text-lg',
    lg: 'lg:text-xl',
    xl: 'xl:text-2xl'
  },
  
  // Largura responsiva
  width: {
    xs: 'w-full',
    sm: 'sm:w-1/2',
    md: 'md:w-1/3',
    lg: 'lg:w-1/4',
    xl: 'xl:w-1/5'
  }
}

// Componente Container responsivo
export const Container = ({ children, className, maxWidth = 'xl', ...props }) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  }
  
  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Componente Grid responsivo
export const Grid = ({ 
  children, 
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className,
  ...props 
}) => {
  const gridClasses = [
    'grid',
    `grid-cols-${cols.xs}`,
    `sm:grid-cols-${cols.sm}`,
    `md:grid-cols-${cols.md}`,
    `lg:grid-cols-${cols.lg}`,
    `gap-${gap}`,
    className
  ].filter(Boolean).join(' ')
  
  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  )
}

// Componente Flex responsivo
export const Flex = ({ 
  children, 
  direction = { xs: 'col', sm: 'row' },
  align = 'start',
  justify = 'start',
  gap = 4,
  className,
  ...props 
}) => {
  const flexClasses = [
    'flex',
    `flex-${direction.xs}`,
    `sm:flex-${direction.sm}`,
    `items-${align}`,
    `justify-${justify}`,
    `gap-${gap}`,
    className
  ].filter(Boolean).join(' ')
  
  return (
    <div className={flexClasses} {...props}>
      {children}
    </div>
  )
}

// Hook para valores responsivos
export const useResponsiveValue = (values) => {
  const breakpoint = useBreakpoint()
  
  if (typeof values === 'object') {
    return values[breakpoint] || values.xs || values.default
  }
  
  return values
}

// Hook para classes responsivas
export const useResponsiveClasses = (classes) => {
  const breakpoint = useBreakpoint()
  
  if (typeof classes === 'object') {
    return classes[breakpoint] || classes.xs || classes.default
  }
  
  return classes
}

// Utilitários de breakpoint
export const breakpointUtils = {
  // Verificar se breakpoint é maior que
  isGreaterThan: (current, target) => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = breakpointOrder.indexOf(current)
    const targetIndex = breakpointOrder.indexOf(target)
    return currentIndex > targetIndex
  },
  
  // Verificar se breakpoint é menor que
  isLessThan: (current, target) => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = breakpointOrder.indexOf(current)
    const targetIndex = breakpointOrder.indexOf(target)
    return currentIndex < targetIndex
  },
  
  // Verificar se breakpoint é igual
  isEqual: (current, target) => current === target,
  
  // Verificar se breakpoint está entre
  isBetween: (current, min, max) => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = breakpointOrder.indexOf(current)
    const minIndex = breakpointOrder.indexOf(min)
    const maxIndex = breakpointOrder.indexOf(max)
    return currentIndex >= minIndex && currentIndex <= maxIndex
  }
}

// Exportar tudo
export default {
  breakpoints,
  mediaQueries,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  responsive,
  Container,
  Grid,
  Flex,
  useResponsiveValue,
  useResponsiveClasses,
  breakpointUtils
}
