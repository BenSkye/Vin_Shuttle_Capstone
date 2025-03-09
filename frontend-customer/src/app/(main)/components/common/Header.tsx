"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { FiMenu, FiX, FiUser, FiLogOut, FiUserCheck, FiClock } from "react-icons/fi"
import { useRouter } from "next/navigation"
import { Logo } from './Logo'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [userName, setUserName] = useState("")
    const router = useRouter()
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Check if user is logged in
        const checkLoginStatus = () => {
            const accessToken = localStorage.getItem('accessToken')
            setIsLoggedIn(!!accessToken)

            // Get user name if available
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}')
                console.log("uerrrr", user)
                setUserName(user.name || "Người dùng")
            } catch (error) {
                setUserName("Người dùng")
            }
        }

        // Check on mount
        checkLoginStatus()

        // Add event listener for storage changes
        window.addEventListener('storage', checkLoginStatus)

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            window.removeEventListener('storage', checkLoginStatus)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('user')
        setIsLoggedIn(false)
        setShowDropdown(false)
        router.push('/login')
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const navItems = [
        { label: "Trang Chủ", href: "/" },
        { label: "Đặt xe theo giờ", href: "/bookhour" },
        { label: "Đặt xe theo tuyến cố định", href: "/bookroute" },
        { label: "Đặt xe điểm đến", href: "/bookdes" },
        { label: "Tính năng", href: "/features" },
        // { label: "Blog", href: "/blog" },
        // { label: "Fanpage", href: "/page" },
    ]

    const AuthButtons = () => {
        if (isLoggedIn) {
            return (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                        aria-label="User menu"
                    >
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-green-100 shadow-md">
                            <FiUser className="text-white text-xl" />
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-700">{userName}</p>
                            <p className="text-xs text-gray-500">Tài khoản của bạn</p>
                        </div>
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 transform transition-all duration-150 origin-top-right">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-700">{userName}</p>
                                <p className="text-xs text-gray-500 mt-1">Đang hoạt động</p>
                            </div>

                            <Link
                                href="/profile"
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 transition-colors"
                                onClick={() => setShowDropdown(false)}
                            >
                                <FiUserCheck className="text-green-500" />
                                <span>Thông tin cá nhân</span>
                            </Link>

                            <Link
                                href="/my-bookings"
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 transition-colors"
                                onClick={() => setShowDropdown(false)}
                            >
                                <FiClock className="text-green-500" />
                                <span>Lịch sử đặt xe</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                            >
                                <FiLogOut className="text-red-500" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    )}
                </div>
            )
        }

        return (
            <>
                <Link
                    href="/login"
                    className="text-gray-600 hover:text-green-500 transition-colors text-lg font-medium"
                >
                    Đăng nhập
                </Link>
                <Link
                    href="/register"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
                >
                    Đăng ký
                </Link>
            </>
        )
    }

    return (
        <nav className="flex items-center justify-between px-4 py-4 bg-white shadow-sm">
            {/* Logo */}
            <Logo size='large' />

            {/* Desktop Navigation */}
            <div className="hidden md:flex justify-center items-center space-x-12 ml-24 mr-auto pl-72">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="text-gray-600 hover:text-green-500 transition-colors text-lg font-medium"
                    >
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
                <AuthButtons />
            </div>

            {/* Mobile Menu Button */}
            <button onClick={toggleMenu} className="md:hidden text-gray-600 text-2xl">
                {isOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="fixed top-0 left-0 w-full h-[60%] bg-white shadow-md flex flex-col items-center py-6 space-y-4 z-50 rounded-b-lg transition-all duration-300">
                    <button onClick={toggleMenu} className="absolute top-4 right-6 text-2xl text-gray-600">
                        <FiX />
                    </button>

                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-gray-600 hover:text-green-500 transition-colors text-lg font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}

                    <div className="flex flex-col space-y-2">
                        <AuthButtons />
                    </div>
                </div>
            )}
        </nav>
    )
}
