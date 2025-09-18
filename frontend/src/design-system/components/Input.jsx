// Componente Input - Alça Hub Design System
import React, { useState, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

const Input = forwardRef(({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  success,
  helperText,
  icon,
  iconPosition = 'left',
  size = 'md',
  variant = 'default',
  fullWidth = false,
  className,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')

  // Tamanhos
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  }

  // Variantes
  const variants = {
    default: {
      base: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
      error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
      success: 'border-success-500 focus:border-success-500 focus:ring-success-500',
      disabled: 'border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed'
    },
    filled: {
      base: 'border-transparent bg-neutral-100 focus:bg-white focus:border-primary-500 focus:ring-primary-500',
      error: 'border-transparent bg-error-50 focus:bg-white focus:border-error-500 focus:ring-error-500',
      success: 'border-transparent bg-success-50 focus:bg-white focus:border-success-500 focus:ring-success-500',
      disabled: 'border-transparent bg-neutral-50 text-neutral-400 cursor-not-allowed'
    },
    outlined: {
      base: 'border-2 border-neutral-300 bg-transparent focus:border-primary-500 focus:ring-primary-500',
      error: 'border-2 border-error-500 bg-transparent focus:border-error-500 focus:ring-error-500',
      success: 'border-2 border-success-500 bg-transparent focus:border-success-500 focus:ring-success-500',
      disabled: 'border-2 border-neutral-200 bg-transparent text-neutral-400 cursor-not-allowed'
    }
  }

  // Classes base
  const baseClasses = [
    'block w-full rounded-md',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-neutral-400'
  ]

  // Classes de tamanho
  const sizeClasses = sizes[size]

  // Classes de variante
  const getVariantClasses = () => {
    if (disabled) return variants[variant].disabled
    if (error) return variants[variant].error
    if (success) return variants[variant].success
    return variants[variant].base
  }

  // Classes de largura
  const widthClasses = fullWidth ? 'w-full' : ''

  // Classes finais
  const inputClasses = cn(
    baseClasses,
    sizeClasses,
    getVariantClasses(),
    widthClasses,
    className
  )

  // Determinar tipo de input
  const inputType = type === 'password' && showPassword ? 'text' : type

  // Handlers
  const handleFocus = (e) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const handleChange = (e) => {
    setInputValue(e.target.value)
    onChange?.(e)
  }

  // Renderizar ícone
  const renderIcon = () => {
    if (!icon) return null
    
    const iconClasses = cn(
      'flex-shrink-0 text-neutral-400',
      size === 'sm' ? 'w-4 h-4' : 
      size === 'md' ? 'w-5 h-5' :
      'w-6 h-6'
    )

    return (
      <span className={iconClasses}>
        {icon}
      </span>
    )
  }

  // Renderizar ícone de status
  const renderStatusIcon = () => {
    if (error) {
      return <AlertCircle className="w-5 h-5 text-error-500" />
    }
    if (success) {
      return <CheckCircle className="w-5 h-5 text-success-500" />
    }
    return null
  }

  // Renderizar botão de toggle de senha
  const renderPasswordToggle = () => {
    if (type !== 'password') return null
    
    return (
      <button
        type="button"
        className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none focus:text-neutral-600"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    )
  }

  // Renderizar label
  const renderLabel = () => {
    if (!label) return null
    
    return (
      <label className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
    )
  }

  // Renderizar helper text
  const renderHelperText = () => {
    if (!helperText && !error) return null
    
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1"
        >
          <p className={cn(
            'text-sm',
            error ? 'text-error-600' : 'text-neutral-500'
          )}>
            {error || helperText}
          </p>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className={cn('relative', fullWidth ? 'w-full' : '')}>
      {renderLabel()}
      
      <div className="relative">
        {/* Input com ícone à esquerda */}
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {renderIcon()}
          </div>
        )}
        
        {/* Input principal */}
        <motion.input
          ref={ref}
          type={inputType}
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            inputClasses,
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            (error || success) && 'pr-10',
            type === 'password' && 'pr-10'
          )}
          {...props}
        />
        
        {/* Ícone à direita */}
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {renderIcon()}
          </div>
        )}
        
        {/* Ícone de status */}
        {(error || success) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {renderStatusIcon()}
          </div>
        )}
        
        {/* Botão de toggle de senha */}
        {type === 'password' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {renderPasswordToggle()}
          </div>
        )}
      </div>
      
      {renderHelperText()}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }
export default Input
