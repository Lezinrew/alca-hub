// Componente Button - Alça Hub Design System
import React from 'react'
import { motion } from 'framer-motion'
import { designTokens } from '../tokens'
import { cn } from '../../lib/utils'

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  onClick,
  ...props
}, ref) => {
  // Variantes de estilo
  const variants = {
    primary: {
      base: 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600 focus:ring-primary-500',
      disabled: 'bg-primary-300 text-white border-primary-300 cursor-not-allowed'
    },
    secondary: {
      base: 'bg-secondary-100 text-secondary-900 border-secondary-200 hover:bg-secondary-200 focus:ring-secondary-500',
      disabled: 'bg-secondary-50 text-secondary-400 border-secondary-100 cursor-not-allowed'
    },
    outline: {
      base: 'bg-transparent text-primary-500 border-primary-500 hover:bg-primary-50 focus:ring-primary-500',
      disabled: 'bg-transparent text-primary-300 border-primary-300 cursor-not-allowed'
    },
    ghost: {
      base: 'bg-transparent text-primary-500 border-transparent hover:bg-primary-50 focus:ring-primary-500',
      disabled: 'bg-transparent text-primary-300 border-transparent cursor-not-allowed'
    },
    destructive: {
      base: 'bg-error-500 text-white border-error-500 hover:bg-error-600 focus:ring-error-500',
      disabled: 'bg-error-300 text-white border-error-300 cursor-not-allowed'
    },
    success: {
      base: 'bg-success-500 text-white border-success-500 hover:bg-success-600 focus:ring-success-500',
      disabled: 'bg-success-300 text-white border-success-300 cursor-not-allowed'
    }
  }

  // Tamanhos
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }

  // Classes base
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-md',
    'border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'relative overflow-hidden'
  ]

  // Classes de variante
  const variantClasses = disabled 
    ? variants[variant].disabled 
    : variants[variant].base

  // Classes de tamanho
  const sizeClasses = sizes[size]

  // Classes de largura
  const widthClasses = fullWidth ? 'w-full' : ''

  // Classes finais
  const buttonClasses = cn(
    baseClasses,
    variantClasses,
    sizeClasses,
    widthClasses,
    className
  )

  // Animações
  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    disabled: { scale: 1 }
  }

  // Renderizar ícone
  const renderIcon = () => {
    if (!icon) return null
    
    const iconClasses = cn(
      'flex-shrink-0',
      size === 'xs' ? 'w-3 h-3' : 
      size === 'sm' ? 'w-4 h-4' :
      size === 'md' ? 'w-5 h-5' :
      size === 'lg' ? 'w-6 h-6' :
      'w-7 h-7'
    )

    return (
      <span className={iconClasses}>
        {icon}
      </span>
    )
  }

  // Renderizar loading
  const renderLoading = () => {
    if (!loading) return null
    
    return (
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-inherit"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={cn(
            'animate-spin rounded-full border-2 border-current border-t-transparent',
            size === 'xs' ? 'w-3 h-3' : 
            size === 'sm' ? 'w-4 h-4' :
            size === 'md' ? 'w-5 h-5' :
            size === 'lg' ? 'w-6 h-6' :
            'w-7 h-7'
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    )
  }

  return (
    <motion.button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      variants={buttonVariants}
      whileHover={!disabled && !loading ? 'hover' : 'disabled'}
      whileTap={!disabled && !loading ? 'tap' : 'disabled'}
      {...props}
    >
      {/* Conteúdo do botão */}
      <div className={cn(
        'flex items-center justify-center gap-2',
        loading && 'opacity-0'
      )}>
        {icon && iconPosition === 'left' && renderIcon()}
        {children}
        {icon && iconPosition === 'right' && renderIcon()}
      </div>
      
      {/* Loading overlay */}
      {renderLoading()}
    </motion.button>
  )
})

Button.displayName = 'Button'

export { Button }
export default Button
