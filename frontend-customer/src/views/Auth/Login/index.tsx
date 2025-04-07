'use client'

import { useState } from 'react'

import { message } from 'antd'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiPhone } from 'react-icons/fi'

import { Routes } from '@/constants/routers'
import { useAuth as useAuthContext } from '@/context/AuthContext'
import { useAuth as useAuthHook } from '@/hooks/useAuth'

export default function LoginPage() {
  const [messageApi, contextHolder] = message.useMessage()
  const { login } = useAuthContext()
  const { doLogin, isLoginPending, loginError } = useAuthHook({
    onLoginSuccess: (data) => {
      if (data.token && data.userId) {
        login(data.token.accessToken, data.token.refreshToken || '', data.userId)
      }
    },
  })
  const [formData, setFormData] = useState({ phone: '', otp: '' })
  const [showOtp, setShowOtp] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (!showOtp) {
        // First step: Send OTP
        const response = await doLogin({ phone: formData.phone })
        if (response.isValid && response.data) {
          setShowOtp(true)
          messageApi.success({
            content: `Mã OTP của bạn là: ${response.data}`,
            duration: 10,
          })
        }
      } else {
        // Second step: Verify OTP
        await doLogin({ phone: formData.phone, code: formData.otp })
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      {contextHolder}
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
              Đăng nhập
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-sm text-white/90"
            >
              Hoặc{' '}
              <Link
                href={Routes.AUTH.SIGNUP}
                className="font-medium text-green-400 drop-shadow-md transition-colors hover:text-green-300"
              >
                đăng ký tài khoản mới
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
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    required
                    disabled={isLoginPending}
                    className="w-full rounded-lg border border-white/30 bg-white/10 px-10 py-3 text-white placeholder-white/70 shadow-lg backdrop-blur-lg transition-all focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                {showOtp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="text"
                      placeholder="Nhập mã OTP"
                      required
                      disabled={isLoginPending}
                      className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-3 text-white placeholder-white/70 shadow-lg backdrop-blur-lg transition-all focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    />
                  </motion.div>
                )}
              </div>

              {(error || loginError) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm font-medium text-red-400 drop-shadow-md"
                >
                  {error || (loginError instanceof Error ? loginError.message : 'Có lỗi xảy ra. Vui lòng thử lại.')}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoginPending}
                className="w-full rounded-md bg-green-500 py-3 font-medium text-white shadow-lg transition-all hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black/50 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoginPending ? 'Đang xử lý...' : showOtp ? 'Xác nhận OTP' : 'Gửi mã OTP'}
              </button>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </>
  )
}
