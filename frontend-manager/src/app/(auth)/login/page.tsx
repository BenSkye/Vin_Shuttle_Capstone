"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FiPhone } from "react-icons/fi"

import { loginCustomer } from "../../../API/user"
import { verifyOTP } from "../../../API/user"
import { useRouter } from "next/navigation"

interface OTPResponse {
    isValid: boolean;
    token: {
        accessToken: string;
        refreshToken: string;
    };
    userId: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        phone: "",
        otp: ""
    })
    const [shouldFetch, setShouldFetch] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchOTP = async () => {
            if (!shouldFetch) return;

            try {
                const response = await loginCustomer({ phone: formData.phone })
                console.log('OTP received:', response);
                setShowOtp(true);
                setError("");
            } catch (error) {
                setError("Failed to send OTP. Please try again.");
                console.error('Login failed:', error);
            } finally {
                setShouldFetch(false);
            }
        };

        fetchOTP();
    }, [shouldFetch, formData.phone]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!showOtp) {
                setShouldFetch(true);
            } else {
                // Verify OTP
                const response = await verifyOTP({
                    phone: formData.phone,
                    code: formData.otp  // Changed from 'otp' to 'code' to match API
                });

                const data = response as OTPResponse;

                if (data.isValid) {
                    // Store tokens in localStorage
                    localStorage.setItem('accessToken', data.token.accessToken);
                    localStorage.setItem('refreshToken', data.token.refreshToken);
                    localStorage.setItem('userId', data.userId);

                    // Clear any existing errors
                    setError("");

                    // Redirect to home page or dashboard
                    router.push('/');
                } else {
                    setError("Invalid OTP code. Please try again.");
                }
            }
        } catch (error) {
            setError(showOtp ? "Invalid OTP code. Please try again." : "Failed to send OTP. Please try again.");
            console.error('Operation failed:', error);
        }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Right side - Login Form */}
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
                                <FiPhone className="absolute top-3 left-3 text-gray-400" />
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
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
                                        className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
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
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                {showOtp ? 'Xác nhận OTP' : 'Gửi mã OTP'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
