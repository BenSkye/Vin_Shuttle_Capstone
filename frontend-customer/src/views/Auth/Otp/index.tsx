'use client'

import { useState } from 'react'

import Link from 'next/link'

export default function OTPPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý gửi OTP
    console.log('OTP sent to:', phone)
    setIsOtpSent(true)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý xác minh OTP
    console.log('Verifying OTP:', otp)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {isOtpSent ? 'Nhập OTP' : 'Xác nhận số điện thoại'}
          </h2>
        </div>
        {!isOtpSent ? (
          <form className="space-y-6" onSubmit={handleSendOtp}>
            <div className="relative">
              <label htmlFor="phone" className="sr-only">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="block w-full appearance-none rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Gửi mã OTP
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleVerifyOtp}>
            <div className="relative">
              <label htmlFor="otp" className="sr-only">
                Mã OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="block w-full appearance-none rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Xác minh OTP
            </button>
          </form>
        )}
        <div className="text-center text-sm text-gray-600">
          <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
