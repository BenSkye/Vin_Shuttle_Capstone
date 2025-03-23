'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiPhone } from 'react-icons/fi'

import { useAuth } from '../../../context/AuthContext'
import { loginCustomer, verifyOTP } from '../../../service/user.service'

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
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Đăng nhập</h2>
          <p className="text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
              đăng ký tài khoản mới
            </Link>
          </p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  required
                  className="w-full rounded-lg border px-10 py-2 focus:outline-none focus:ring-green-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              {showOtp && (
                <input
                  type="text"
                  placeholder="Nhập mã OTP"
                  required
                  className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-green-500"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                />
              )}
            </div>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-md bg-green-600 py-2 text-white hover:bg-green-700"
            >
              {showOtp ? 'Xác nhận OTP' : 'Gửi mã OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
