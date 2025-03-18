"use client"

import { jwtDecode } from "jwt-decode";
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import Cookies from "js-cookie"
import { FiMenu, FiX, FiUser, FiLogOut, FiUserCheck, FiClock, FiBell } from "react-icons/fi"
import { useRouter } from "next/navigation"
import { Logo } from './Logo'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [userName, setUserName] = useState("")
    const router = useRouter()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notificationRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const checkLoginStatus = () => {
            const accessToken = Cookies.get('authorization')
            setIsLoggedIn(!!accessToken)

            if (accessToken) {
                try {
                    const decodedToken: any = jwtDecode(accessToken)
                    setUserName(decodedToken.name || "Người dùng")
                } catch (error) {
                    console.error("Lỗi giải mã token:", error)
                    setUserName("Người dùng")
                }
            }
        }

        checkLoginStatus()
        window.addEventListener('storage', checkLoginStatus)

        return () => {
            window.removeEventListener('storage', checkLoginStatus)
        }
    }, [])

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        Cookies.remove('authorization')
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        Cookies.remove('userId')
        Cookies.remove('user')
        setIsLoggedIn(false)
        setShowDropdown(false)
        router.push('/login')
    }
    const toggleMenu = () => setIsOpen(!isOpen)
    const toggleNotifications = () => setShowNotifications(!showNotifications)

    const navItems = [
        { label: "Trang Chủ", href: "/" },
        { label: "Đặt xe theo giờ", href: "/bookhour" },
        { label: "Đặt xe theo tuyến cố định", href: "/bookroute" },
        { label: "Đặt xe điểm đến", href: "/bookdes" },
        { label: "Tính năng", href: "/features" },
    ]

    const notifications = [
        { id: 1, message: "Bạn có chuyến xe sắp tới vào 10:30 sáng" },
        { id: 2, message: "Đơn đặt xe của bạn đã được xác nhận!" },
        { id: 3, message: "Có ưu đãi mới cho khách hàng thân thiết" }
    ]

    const AuthButtons = () => (
        isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-green-100 shadow-md">
                        <FiUser className="text-white text-xl" />
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-700">{userName}</p>
                        <p className="text-xs text-gray-500">Tài khoản của bạn</p>
                    </div>
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition">
                            <FiUserCheck className="text-green-500" />
                            <span>Thông tin cá nhân</span>
                        </Link>
                        <Link href="/trips" className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition">
                            <FiClock className="text-green-500" />
                            <span>Lịch sử chuyến đi</span>
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition border-t border-gray-100">
                            <FiLogOut className="text-red-500" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                )}
            </div>
        ) : (
            <>
                <Link href="/login" className="text-gray-600 hover:text-green-500 transition text-lg font-medium">Đăng nhập</Link>
                <Link href="/register" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-lg font-medium">Đăng ký</Link>
            </>
        )
    )

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <nav className="flex items-center justify-between px-4 py-4 bg-white">
                {/* Logo */}
                <Logo size='large' />

                {/* Desktop Navigation - Dịch về trái */}
                <div className="hidden md:flex justify-center items-center space-x-8 ">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className="text-gray-600 hover:text-green-500 transition text-lg font-medium">
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Thông báo & Auth Buttons */}
                <div className="hidden md:flex items-center space-x-4 relative">
                    {/* Icon Thông báo */}
                    <div className="relative" ref={notificationRef}>
                        <button onClick={toggleNotifications} className="text-gray-600 hover:text-green-500 text-2xl relative">
                            <FiBell />
                            {notifications.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                                <p className="px-4 py-2 text-sm font-medium text-gray-700 border-b">Thông báo</p>
                                {notifications.length === 0 ? (
                                    <p className="px-4 py-2 text-gray-500 text-sm">Không có thông báo</p>
                                ) : (
                                    notifications.map((notif) => (
                                        <div key={notif.id} className="px-4 py-3 text-gray-700 hover:bg-gray-100 transition">
                                            {notif.message}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <AuthButtons />
                </div>

                {/* Mobile Menu Button */}
                <button onClick={toggleMenu} className="md:hidden text-gray-600 text-2xl">
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>
            </nav>

            {isOpen && (
                <div className="md:hidden fixed top-[72px] left-0 right-0 bottom-0 bg-white overflow-y-auto z-50 shadow-lg">
                    <div className="flex flex-col space-y-4 p-4 pb-20 max-h-[calc(100vh-72px)]">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-gray-600 hover:text-green-500 transition text-lg font-medium py-2 border-b border-gray-100"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* Mobile notification */}
                        <div className="pt-2">
                            <p className="font-medium text-gray-700 mb-2">Thông báo</p>
                            {notifications.length === 0 ? (
                                <p className="text-gray-500 text-sm">Không có thông báo</p>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="p-2 bg-gray-50 rounded text-gray-700 text-sm">
                                            {notif.message}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Auth buttons for mobile */}
                        <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
                            {isLoggedIn ? (
                                <>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                            <FiUser className="text-white text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-700">{userName}</p>
                                            <p className="text-xs text-gray-500">Tài khoản của bạn</p>
                                        </div>
                                    </div>
                                    <Link href="/profile" className="flex items-center gap-3 py-2 text-gray-600" onClick={() => setIsOpen(false)}>
                                        <FiUserCheck className="text-green-500" />
                                        <span>Thông tin cá nhân</span>
                                    </Link>
                                    <Link href="/trips" className="flex items-center gap-3 py-2 text-gray-600" onClick={() => setIsOpen(false)}>
                                        <FiClock className="text-green-500" />
                                        <span>Lịch sử chuyến đi</span>
                                    </Link>
                                    <button onClick={handleLogout} className="flex items-center gap-3 py-2 text-red-600">
                                        <FiLogOut className="text-red-500" />
                                        <span>Đăng xuất</span>
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col space-y-3">
                                    <Link href="/login" className="text-center py-2 text-gray-600 hover:text-green-500 border border-gray-200 rounded-lg" onClick={() => setIsOpen(false)}>
                                        Đăng nhập
                                    </Link>
                                    <Link href="/register" className="text-center py-2 bg-green-500 text-white rounded-lg hover:bg-green-600" onClick={() => setIsOpen(false)}>
                                        Đăng ký
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}