import type { Easing } from 'framer-motion'

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as Easing },
}

export const cardHover = {
  scale: 1.02,
  transition: { duration: 0.15, ease: 'easeOut' as Easing },
}

export const cardTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
}

export const cardFlip = {
  duration: 0.6,
  ease: [0.68, -0.55, 0.265, 1.55] as Easing,
}

export const springConfig = {
  stiffness: 300,
  damping: 30,
}
