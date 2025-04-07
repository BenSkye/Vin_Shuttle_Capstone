import { motion } from 'framer-motion'
import Image from 'next/image'

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-surface"
    >
      <div className="relative mb-12 h-60 w-60">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{
            x: [-50, 50, -50],
            rotate: [0, 5, -5, 0],
            opacity: 1,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            opacity: { duration: 0.3 },
          }}
          className="relative h-full w-full"
        >
          <Image
            src="/images/bus-loading.svg"
            alt="Loading Bus"
            fill
            className="object-contain drop-shadow-xl"
            priority
          />
        </motion.div>
      </div>

      <div className="flex w-full max-w-md flex-col items-center px-4">
        <div className="relative mb-6 h-3 w-full overflow-hidden rounded-full bg-secondary-100">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500 to-transparent"
            style={{ width: '50%' }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-2xl font-medium text-content-secondary"
        >
          Đang tải trang...
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="mt-12 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="text-base text-content-tertiary"
        >
          VinShuttle - Dịch vụ xe bus thông minh
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          className="mt-2 text-sm text-content-tertiary"
        >
          Vui lòng đợi trong giây lát
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
