'use client'

import { Suspense } from 'react'

import { motion } from 'framer-motion'

import { LoadingScreen } from '@/components/common/LoadingScreen'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {children}
      </motion.div>
    </Suspense>
  )
}
