"use client"

import { useState } from "react"
import Link from "next/link"

export default function OTPPage() {
    const [phone, setPhone] = useState("")
    const [otp, setOtp] = useState("")
    const [isOtpSent, setIsOtpSent] = useState(false)

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault()
        // Xử lý gửi OTP
        console.log("OTP sent to:", phone)
        setIsOtpSent(true)
    }

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault()
        // Xử lý xác minh OTP
        console.log("Verifying OTP:", otp)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        {isOtpSent ? "Nhập OTP" : "Xác nhận số điện thoại"}
                    </h2>
                </div>
                {!isOtpSent ? (
                    <form className="space-y-6" onSubmit={handleSendOtp}>
                        <div className="relative">
                            <label htmlFor="phone" className="sr-only">Số điện thoại</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                className="appearance-none rounded-lg block w-full px-4 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="Số điện thoại"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Gửi mã OTP
                        </button>
                    </form>
                ) : (
                    <form className="space-y-6" onSubmit={handleVerifyOtp}>
                        <div className="relative">
                            <label htmlFor="otp" className="sr-only">Mã OTP</label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                className="appearance-none rounded-lg block w-full px-4 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="Nhập mã OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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