'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiPhone } from 'react-icons/fi'

import { useAuth } from '../../../context/AuthContext'
import { loginCustomer, verifyOTP } from '../../../service/user.service'
import { Routes } from '@/constants/routers'

// Import useAuth

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ phone: '', otp: '' })
  const [shouldFetch, setShouldFetch] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOTP = async () => {
      if (!shouldFetch) return
      try {
        await loginCustomer({ phone: formData.phone })
        setShowOtp(true)
        setError('')
      } catch (error) {
        setError('Failed to send OTP. Please try again.')
      } finally {
        setShouldFetch(false)
      }
    }
    fetchOTP()
  }, [shouldFetch, formData.phone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!showOtp) {
        setShouldFetch(true)
      } else {
        const response = await verifyOTP({ phone: formData.phone, code: formData.otp })
        if (response.isValid) {
          // Cập nhật AuthContext
          login(response.token.accessToken, response.token.refreshToken || '', response.userId)

          router.push('/')
        } else {
          setError('Mã OTP không hợp lệ. Vui lòng thử lại.')
        }
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi xác thực OTP. Vui lòng thử lại.')
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[url('/images/vinhome-background.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="absolute left-1/2 top-1/2 w-[450px] -translate-x-1/2 -translate-y-1/2 transform space-y-8 rounded-[17px] border-[5px] border-white/20 bg-black/50 p-8 shadow-[0_0_40px_rgba(129,236,174,0.6)] backdrop-blur-md">
        <div className="w-full max-w-md space-y-8">
          <h2 className="text-center text-3xl font-extrabold text-white drop-shadow-lg">Đăng nhập</h2>
          <p className="text-center text-sm text-white/90">
            Hoặc{' '}
            <Link href={Routes.AUTH.SIGNUP} className="font-medium text-green-400 hover:text-green-300 drop-shadow-md">
              đăng ký tài khoản mới
            </Link>
          </p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-white/70" />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  required
                  className="w-full rounded-lg border border-white/30 bg-white/10 px-10 py-3 text-white placeholder-white/70 shadow-lg backdrop-blur-lg focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              {showOtp && (
                <input
                  type="text"
                  placeholder="Nhập mã OTP"
                  required
                  className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-3 text-white placeholder-white/70 shadow-lg backdrop-blur-lg focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                />
              )}
            </div>
            {error && <p className="text-center text-sm font-medium text-red-400 drop-shadow-md">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-md bg-green-500 py-3 font-medium text-white shadow-lg transition-all hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black/50"
            >
              {showOtp ? 'Xác nhận OTP' : 'Gửi mã OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
