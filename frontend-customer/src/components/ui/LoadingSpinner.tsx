import { motion } from 'framer-motion'

import { cn } from '@/libs/utils'

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn('border-primary/20 border-t-primary rounded-full border-2', sizes[size])}
    />
  )
}
