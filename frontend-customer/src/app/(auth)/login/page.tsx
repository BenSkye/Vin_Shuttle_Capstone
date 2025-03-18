"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FiPhone } from "react-icons/fi"
import Cookies from 'js-cookie'
import { loginCustomer, verifyOTP } from "../../../service/user.service"
import { useRouter } from "next/navigation"
import { useAuth } from '@/contexts/AuthContext'

interface OTPResponse {
    isValid: boolean
    token: {
        accessToken: string
        refreshToken: string
    }
    userId: string
}

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        phone: "",
        otp: ""
    })
    const [shouldFetch, setShouldFetch] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false) 

    useEffect(() => {
        const fetchOTP = async () => {
            if (!shouldFetch) return

            try {
                setIsLoading(true)
                const response = await loginCustomer({ phone: formData.phone })
                console.log('OTP received:', response)
                setShowOtp(true)
                setError("")
            } catch (error) {
                setError("Failed to send OTP. Please try again.")
                console.error('Login failed:', error)
            } finally {
                setShouldFetch(false)
                setIsLoading(false)
            }
        }

        fetchOTP()
    }, [shouldFetch, formData.phone])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Prevent submission if already processing
        if (isLoading) return

        try {
            setIsLoading(true)
            if (!showOtp) {
                setShouldFetch(true)
            } else {
                const response = await verifyOTP({
                    phone: formData.phone,
                    code: formData.otp
                })

                console.log('OTP verification response:', response)
                const data = response as OTPResponse

                if (data.isValid) {
                    Cookies.set('authorization', data.token.accessToken, { expires: 2 })
                    Cookies.set('refreshToken', data.token.refreshToken, { expires: 2 })
                    Cookies.set('userId', data.userId, { expires: 2 })

                    login({
                        id: data.userId,
                        phone: formData.phone
                    })

                    router.push('/')
                } else {
                    setError("Invalid OTP code. Please try again.")
                }
            }
        } catch (error) {
            setError(showOtp ? "Invalid OTP code. Please try again." : "Failed to send OTP. Please try again.")
            console.error('Operation failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Đăng nhập
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Hoặc{" "}
                            <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
                                đăng ký tài khoản mới
                            </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div className="relative">
                                <label htmlFor="phone" className="sr-only">
                                    Số điện thoại
                                </label>
                                <FiPhone className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    disabled={isLoading}
                                    className="appearance-none rounded-lg relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm disabled:bg-gray-100"
                                    placeholder="Số điện thoại"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            {showOtp && (
                                <div className="relative">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        disabled={isLoading}
                                        className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm disabled:bg-gray-100"
                                        placeholder="Nhập mã OTP"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Đang xử lý...' : (showOtp ? 'Xác nhận OTP' : 'Gửi mã OTP')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}