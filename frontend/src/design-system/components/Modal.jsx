// Componente Modal - Alça Hub Design System
import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  ...props
}) => {
  const modalRef = useRef(null)

  // Tamanhos
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  // Variantes
  const variants = {
    default: 'bg-white',
    dark: 'bg-neutral-900 text-white',
    glass: 'bg-white/80 backdrop-blur-sm',
    gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50'
  }

  // Classes base
  const baseClasses = [
    'relative w-full',
    'rounded-lg shadow-xl',
    'transform transition-all duration-300',
    'focus:outline-none'
  ]

  // Classes de tamanho
  const sizeClasses = sizes[size]

  // Classes de variante
  const variantClasses = variants[variant]

  // Classes finais
  const modalClasses = cn(
    baseClasses,
    sizeClasses,
    variantClasses,
    className
  )

  // Animações
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0
    }
  }

  // Handlers
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (closeOnEscape && e.key === 'Escape') {
      onClose()
    }
  }

  // Effects
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Renderizar modal
  const renderModal = () => {
    if (!isOpen) return null

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleOverlayClick}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={modalClasses}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            {...props}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div>
                  {title && (
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-neutral-500">
                      {description}
                    </p>
                  )}
                </div>
                
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Renderizar no portal
  return createPortal(renderModal(), document.body)
}

// Subcomponentes do Modal
const ModalHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('flex items-center justify-between p-6 border-b border-neutral-200', className)}
      {...props}
    >
      {children}
    </div>
  )
}

const ModalTitle = ({ children, className, ...props }) => {
  return (
    <h2
      className={cn('text-xl font-semibold text-neutral-900', className)}
      {...props}
    >
      {children}
    </h2>
  )
}

const ModalDescription = ({ children, className, ...props }) => {
  return (
    <p
      className={cn('mt-1 text-sm text-neutral-500', className)}
      {...props}
    >
      {children}
    </p>
  )
}

const ModalContent = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

const ModalFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('flex items-center justify-end gap-3 p-6 border-t border-neutral-200', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Hook para usar modal
const useModal = () => {
  const [isOpen, setIsOpen] = React.useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(!isOpen)

  return {
    isOpen,
    open,
    close,
    toggle
  }
}

// Exportar componentes
export { 
  Modal, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription, 
  ModalContent, 
  ModalFooter,
  useModal 
}
export default Modal
