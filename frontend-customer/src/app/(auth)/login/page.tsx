"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FiPhone } from "react-icons/fi"
import { loginCustomer, verifyOTP } from "../../../service/user.service"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../context/AuthContext" // Import useAuth
import Cookies from 'js-cookie'; // Import js-cookie

export default function LoginPage() {
    const router = useRouter()
    const { setAuthUser, setIsLoggedIn } = useAuth() // Use AuthContext
    const [formData, setFormData] = useState({ phone: "", otp: "" })
    const [shouldFetch, setShouldFetch] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchOTP = async () => {
            if (!shouldFetch) return
            try {
                await loginCustomer({ phone: formData.phone })
                setShowOtp(true)
                setError("")
            } catch (error) {
                setError("Failed to send OTP. Please try again.")
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
                    // Lưu token và userId vào cookies (với hạn 2 ngày)
                    Cookies.set('authorization', response.token.accessToken, { expires: 2 });
                    Cookies.set('refreshToken', response.token.refreshToken || '', { expires: 2 });
                    Cookies.set('userId', response.userId, { expires: 2 });

                    // Cập nhật AuthContext
                    setAuthUser({
                        id: response.userId,
                        phone: formData.phone,
                        name: response.name || "Người dùng" // Fallback name
                    })
                    setIsLoggedIn(true)
                    router.push("/")
                } else {
                    setError("Mã OTP không hợp lệ. Vui lòng thử lại.")
                }
            }
        } catch (error) {
            setError("Có lỗi xảy ra khi xác thực OTP. Vui lòng thử lại.")
        }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">Đăng nhập</h2>
                    <p className="text-center text-sm text-gray-600">
                        Hoặc{" "}
                        <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
                            đăng ký tài khoản mới
                        </Link>
                    </p>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="relative">
                                <FiPhone className="absolute top-3 left-3 text-gray-400" />
                                <input
                                    type="tel"
                                    placeholder="Số điện thoại"
                                    required
                                    className="w-full px-10 py-2 border rounded-lg focus:outline-none focus:ring-green-500"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            {showOtp && (
                                <input
                                    type="text"
                                    placeholder="Nhập mã OTP"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-green-500"
                                    value={formData.otp}
                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                />
                            )}
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            {showOtp ? "Xác nhận OTP" : "Gửi mã OTP"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}