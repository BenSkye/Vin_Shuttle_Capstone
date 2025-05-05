'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiPhone, FiUser } from 'react-icons/fi'

import { Routes } from '@/constants/routers'
import { useAuth } from '@/hooks/useAuth'

interface SignupFormData {
  name: string
  phone: string
}

export default function SignupPage() {
  const { doRegister, isRegisterPending, registerError } = useAuth()

  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await doRegister({
        name: formData.name,
        phone: formData.phone,
      })
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[url('/images/vinhome-background.jpg')] bg-cover bg-center bg-no-repeat px-4 py-8">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[90%] space-y-6 rounded-2xl border-[3px] border-white/20 bg-black/50 p-6 shadow-[0_0_40px_rgba(129,236,174,0.6)] backdrop-blur-md sm:max-w-[450px] sm:space-y-8 sm:p-8"
      >
        <div className="w-full space-y-6 sm:space-y-8">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-2xl font-extrabold text-white drop-shadow-lg sm:text-3xl"
          >
            Đăng ký tài khoản
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-white/90"
          >
            Đã có tài khoản?{' '}
            <Link
              href={Routes.AUTH.LOGIN}
              className="font-medium text-green-400 drop-shadow-md transition-colors hover:text-green-300"
            >
              Đăng nhập ngay
            </Link>
          </motion.p>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                <input
                  type="text"
                  placeholder="Họ và tên"
                  required
                  disabled={isRegisterPending}
                  className="w-full rounded-lg border border-white/30 bg-white/10 px-10 py-3 text-white placeholder-white/70 shadow-lg backdrop-blur-lg transition-all focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  required
                  disabled={isRegisterPending}
                  className="w-full rounded-lg border border-white/30 bg-white/10 px-10 py-3 text-white placeholder-white/70 shadow-lg backdrop-blur-lg transition-all focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {registerError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm font-medium text-red-400 drop-shadow-md"
              >
                {registerError instanceof Error
                  ? registerError.message
                  : 'Có lỗi xảy ra. Vui lòng thử lại.'}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isRegisterPending}
              className="w-full rounded-md bg-green-500 py-3 font-medium text-white shadow-lg transition-all hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black/50 active:scale-[0.98] disabled:opacity-50"
            >
              {isRegisterPending ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  )
}
