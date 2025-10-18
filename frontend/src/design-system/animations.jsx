// Sistema de Animações - Alça Hub Design System
import { motion, AnimatePresence } from 'framer-motion'
import { designTokens } from './tokens'

// Animações predefinidas
export const animations = {
  // Animações de entrada
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  slideInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  
  slideInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  
  scaleInUp: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  },
  
  // Animações de hover
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  
  hoverLift: {
    y: -2,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.2 }
  },
  
  hoverGlow: {
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    transition: { duration: 0.2 }
  },
  
  // Animações de tap
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },
  
  tapBounce: {
    scale: 0.9,
    transition: { 
      type: 'spring', 
      stiffness: 400, 
      damping: 10 
    }
  },
  
  // Animações de loading
  spin: {
    rotate: 360,
    transition: { 
      duration: 1, 
      repeat: Infinity, 
      ease: 'linear' 
    }
  },
  
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: { 
      duration: 2, 
      repeat: Infinity, 
      ease: 'easeInOut' 
    }
  },
  
  bounce: {
    y: [0, -10, 0],
    transition: { 
      duration: 0.6, 
      repeat: Infinity, 
      ease: 'easeInOut' 
    }
  },
  
  // Animações de transição
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  staggerReverse: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    }
  }
}

// Transições predefinidas
export const transitions = {
  // Transições básicas
  fast: { duration: 0.15, ease: 'easeOut' },
  normal: { duration: 0.3, ease: 'easeOut' },
  slow: { duration: 0.5, ease: 'easeOut' },
  
  // Transições de spring
  spring: { 
    type: 'spring', 
    stiffness: 300, 
    damping: 30 
  },
  
  springBounce: { 
    type: 'spring', 
    stiffness: 400, 
    damping: 10 
  },
  
  springSmooth: { 
    type: 'spring', 
    stiffness: 200, 
    damping: 25 
  },
  
  // Transições de easing
  easeIn: { duration: 0.3, ease: 'easeIn' },
  easeOut: { duration: 0.3, ease: 'easeOut' },
  easeInOut: { duration: 0.3, ease: 'easeInOut' },
  
  // Transições customizadas
  custom: (duration = 0.3, ease = 'easeOut') => ({ duration, ease })
}

// Hook para animações
export const useAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false)
  
  const startAnimation = () => setIsAnimating(true)
  const stopAnimation = () => setIsAnimating(false)
  
  return { isAnimating, startAnimation, stopAnimation }
}

// Hook para animações sequenciais
export const useSequenceAnimation = (steps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsComplete(true)
    }
  }
  
  const reset = () => {
    setCurrentStep(0)
    setIsComplete(false)
  }
  
  const start = () => {
    setCurrentStep(0)
    setIsComplete(false)
  }
  
  return {
    currentStep,
    isComplete,
    nextStep,
    reset,
    start,
    currentAnimation: steps[currentStep]
  }
}

// Componente para animações de entrada
export const AnimatedContainer = ({ 
  children, 
  animation = 'fadeIn',
  delay = 0,
  duration = 0.3,
  className,
  ...props 
}) => {
  const animationConfig = animations[animation] || animations.fadeIn
  
  return (
    <motion.div
      initial={animationConfig.initial}
      animate={animationConfig.animate}
      exit={animationConfig.exit}
      transition={{
        duration,
        delay,
        ...transitions.normal
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Componente para animações de lista
export const AnimatedList = ({ 
  children, 
  staggerDelay = 0.1,
  className,
  ...props 
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animations.stagger}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Componente para animações de item de lista
export const AnimatedListItem = ({ 
  children, 
  animation = 'slideInUp',
  className,
  ...props 
}) => {
  const animationConfig = animations[animation] || animations.slideInUp
  
  return (
    <motion.div
      variants={animationConfig}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Componente para animações de hover
export const HoverAnimation = ({ 
  children, 
  animation = 'hover',
  className,
  ...props 
}) => {
  const animationConfig = animations[animation] || animations.hover
  
  return (
    <motion.div
      whileHover={animationConfig}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Componente para animações de tap
export const TapAnimation = ({ 
  children, 
  animation = 'tap',
  className,
  ...props 
}) => {
  const animationConfig = animations[animation] || animations.tap
  
  return (
    <motion.div
      whileTap={animationConfig}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Componente para animações de loading
export const LoadingAnimation = ({ 
  children, 
  animation = 'spin',
  className,
  ...props 
}) => {
  const animationConfig = animations[animation] || animations.spin
  
  return (
    <motion.div
      animate={animationConfig}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Componente para animações de transição
export const TransitionAnimation = ({ 
  children, 
  show,
  animation = 'fadeIn',
  className,
  ...props 
}) => {
  const animationConfig = animations[animation] || animations.fadeIn
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={animationConfig.initial}
          animate={animationConfig.animate}
          exit={animationConfig.exit}
          transition={transitions.normal}
          className={className}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook para animações responsivas
export const useResponsiveAnimation = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const getAnimation = (mobileAnimation, desktopAnimation) => {
    return isMobile ? mobileAnimation : desktopAnimation
  }
  
  return { isMobile, getAnimation }
}

// Hook para animações de scroll
export const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setIsVisible(window.scrollY > 100)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return { isVisible, scrollY }
}

// Utilitários de animação
export const animationUtils = {
  // Criar animação customizada
  createAnimation: (initial, animate, exit) => ({
    initial,
    animate,
    exit
  }),
  
  // Criar transição customizada
  createTransition: (duration, ease, delay = 0) => ({
    duration,
    ease,
    delay
  }),
  
  // Combinar animações
  combineAnimations: (...animations) => {
    const combined = { initial: {}, animate: {}, exit: {} }
    
    animations.forEach(animation => {
      Object.keys(combined).forEach(key => {
        combined[key] = { ...combined[key], ...animation[key] }
      })
    })
    
    return combined
  },
  
  // Criar animação de stagger
  createStagger: (childrenAnimation, staggerDelay = 0.1) => ({
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    },
    children: childrenAnimation
  })
}

// Exportar tudo
export default {
  animations,
  transitions,
  useAnimation,
  useSequenceAnimation,
  useResponsiveAnimation,
  useScrollAnimation,
  AnimatedContainer,
  AnimatedList,
  AnimatedListItem,
  HoverAnimation,
  TapAnimation,
  LoadingAnimation,
  TransitionAnimation,
  animationUtils
}
