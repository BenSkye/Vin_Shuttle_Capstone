'use client'

import { useEffect, useState } from 'react'

import { message } from 'antd'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiPhone } from 'react-icons/fi'

import { Routes } from '@/constants/routers'

import { useAuth } from '../../../context/AuthContext'
import { loginCustomer, verifyOTP } from '../../../service/user.service'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ phone: '', otp: '' })
  const [shouldFetch, setShouldFetch] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [error, setError] = useState('')
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    const fetchOTP = async () => {
      if (!shouldFetch) return
      try {
        const response = await loginCustomer({ phone: formData.phone })
        setShowOtp(true)
        setError('')
        messageApi.success({
          content: `Mã OTP của bạn là: ${response.data}`,
          duration: 10,
        })
      } catch (err) {
        console.log(err)
        setError('Gửi mã OTP thất bại. Vui lòng thử lại.')
      } finally {
        setShouldFetch(false)
      }
    }
    fetchOTP()
  }, [shouldFetch, formData.phone, messageApi])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!showOtp) {
        setShouldFetch(true)
      } else {
        const response = await verifyOTP({ phone: formData.phone, code: formData.otp })
        if (response.isValid) {
          login(response.token.accessToken, response.token.refreshToken || '', response.userId)
          router.push(Routes.HOME)
        } else {
          setError('Mã OTP không hợp lệ. Vui lòng thử lại.')
        }
      }
    } catch {
      setError('Có lỗi xảy ra khi xác thực OTP. Vui lòng thử lại.')
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
                    className="w-full rounded-lg border border-white/30 bg-white/10 px-10 py-3 text-white placeholder-white/70 shadow-lg backdrop-blur-lg transition-all focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
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
                      className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-3 text-white placeholder-white/70 shadow-lg backdrop-blur-lg transition-all focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    />
                  </motion.div>
                )}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm font-medium text-red-400 drop-shadow-md"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                className="w-full rounded-md bg-green-500 py-3 font-medium text-white shadow-lg transition-all hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black/50 active:scale-[0.98]"
              >
                {showOtp ? 'Xác nhận OTP' : 'Gửi mã OTP'}
              </button>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </>
  )
}
