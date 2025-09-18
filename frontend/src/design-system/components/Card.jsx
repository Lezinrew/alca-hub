// Componente Card - Alça Hub Design System
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const Card = React.forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  hover = false,
  clickable = false,
  loading = false,
  className,
  onClick,
  ...props
}, ref) => {
  // Variantes de estilo
  const variants = {
    default: 'bg-white border border-neutral-200',
    elevated: 'bg-white shadow-lg border-0',
    outlined: 'bg-transparent border-2 border-neutral-300',
    filled: 'bg-neutral-50 border border-neutral-200',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20',
    gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200'
  }

  // Tamanhos
  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  // Classes base
  const baseClasses = [
    'rounded-lg',
    'transition-all duration-200',
    'relative overflow-hidden'
  ]

  // Classes de variante
  const variantClasses = variants[variant]

  // Classes de tamanho
  const sizeClasses = sizes[size]

  // Classes de hover
  const hoverClasses = hover ? 'hover:shadow-md hover:scale-[1.02]' : ''

  // Classes de clickable
  const clickableClasses = clickable ? 'cursor-pointer hover:shadow-md' : ''

  // Classes finais
  const cardClasses = cn(
    baseClasses,
    variantClasses,
    sizeClasses,
    hoverClasses,
    clickableClasses,
    className
  )

  // Animações
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: hover ? { scale: 1.02, y: -2 } : {},
    tap: clickable ? { scale: 0.98 } : {}
  }

  // Renderizar loading overlay
  const renderLoading = () => {
    if (!loading) return null
    
    return (
      <motion.div
        className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={cardClasses}
      onClick={onClick}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {children}
      {renderLoading()}
    </motion.div>
  )
})

Card.displayName = 'Card'

// Subcomponentes do Card
const CardHeader = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
})

CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-neutral-500', className)}
      {...props}
    >
      {children}
    </p>
  )
})

CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
})

CardFooter.displayName = 'CardFooter'

// Exportar componentes
export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
}
export default Card
