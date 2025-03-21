"use client"

import { jwtDecode } from "jwt-decode"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { FiMenu, FiX, FiUser, FiLogOut, FiUserCheck, FiClock, FiBell } from "react-icons/fi"
import { useRouter } from "next/navigation"
import { Logo } from './Logo'
import { useAuth } from "../../../../context/AuthContext"
import { useNotification } from "../../../../context/NotificationContext" // Import useNotification
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Badge } from 'antd'
import { markAsReadNotification, markAllAsReadNotification } from "../../../../service/notification.service"
import { toast } from "react-hot-toast"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const router = useRouter()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notificationRef = useRef<HTMLDivElement>(null)

    // Use AuthContext
    const { authUser, isLoggedIn, logout } = useAuth()

    // Create a local state that mirrors the auth user for debugging
    const [userName, setUserName] = useState<string>("Người dùng")

    // Update local state whenever authUser changes
    useEffect(() => {
        if (authUser && authUser.name) {
            setUserName(authUser.name)
        } else if (isLoggedIn) {
            setUserName("Người dùng")
        }
    }, [authUser, isLoggedIn])

    // Use NotificationContext
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification()

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout() // Use logout from AuthContext
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

    // Format time for notifications
    const formatNotificationTime = (timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: vi });
        } catch (error) {
            return 'Vừa xong';
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notificationId: string, redirectUrl?: string) => {
        try {
            await markAsRead(notificationId);

            if (redirectUrl) {
                router.push(redirectUrl);
            }
            setShowNotifications(false);
        } catch (error) {
            toast.error("Không thể đánh dấu đã đọc thông báo");
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
            // Let the socket update the state
        } catch (error) {
            toast.error("Không thể đánh dấu tất cả thông báo là đã đọc");
        }
    };

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
                <Logo size='large' />
                <div className="hidden md:flex justify-center items-center space-x-8">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className="text-gray-600 hover:text-green-500 transition text-lg font-medium">
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className="hidden md:flex items-center space-x-4 relative">
                    {isLoggedIn && (
                        <div className="relative" ref={notificationRef}>
                            <button onClick={toggleNotifications} className="text-gray-600 hover:text-green-500 text-2xl relative">
                                <Badge count={unreadCount} overflowCount={99}>
                                    <FiBell />
                                </Badge>
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 max-h-[70vh] overflow-y-auto">
                                    <div className="px-4 py-2 flex justify-between items-center border-b">
                                        <p className="text-sm font-medium text-gray-700">Thông báo</p>
                                        {unreadCount > 0 && (
                                            <button
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                                onClick={handleMarkAllAsRead}
                                            >
                                                Đánh dấu tất cả đã đọc
                                            </button>
                                        )}
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center">
                                            <div className="mb-3 flex justify-center">
                                                <FiBell className="text-gray-400 text-3xl" />
                                            </div>
                                            <p className="text-gray-500 text-sm">Không có thông báo</p>
                                        </div>
                                    ) : (
                                        <div>
                                            {notifications.map((notif) => (
                                                <div
                                                    key={notif._id}
                                                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${!notif.isRead ? 'bg-blue-50' : ''}`}
                                                    onClick={() => handleNotificationClick(notif._id, notif.redirectUrl)}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className={`text-sm font-medium ${!notif.isRead ? 'text-blue-800' : 'text-gray-800'}`}>
                                                            {notif.title}
                                                        </p>
                                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                            {formatNotificationTime(notif.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{notif.message}</p>
                                                </div>
                                            ))}

                                            <div className="p-2 text-center">
                                                <button className="text-sm text-blue-600 hover:underline">
                                                    Xem tất cả thông báo
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    <AuthButtons />
                </div>
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
                        {isLoggedIn && (
                            <div className="pt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-medium text-gray-700">Thông báo</p>
                                    {unreadCount > 0 && (
                                        <span
                                            className="text-xs text-blue-600"
                                            onClick={handleMarkAllAsRead}
                                        >
                                            Đánh dấu tất cả đã đọc
                                        </span>
                                    )}
                                </div>
                                {notifications.length === 0 ? (
                                    <p className="text-gray-500 text-sm py-4 text-center">Không có thông báo</p>
                                ) : (
                                    <div className="space-y-2">
                                        {notifications.slice(0, 5).map((notif) => (
                                            <div
                                                key={notif._id}
                                                className={`p-3 rounded text-sm ${!notif.isRead ? 'bg-blue-50' : 'bg-gray-50'}`}
                                                onClick={() => handleNotificationClick(notif._id, notif.redirectUrl)}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className={`font-medium ${!notif.isRead ? 'text-blue-800' : 'text-gray-800'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-xs text-gray-500">
                                                        {formatNotificationTime(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600">{notif.message}</p>
                                            </div>
                                        ))}
                                        {notifications.length > 5 && (
                                            <div className="text-center mt-2">
                                                <button className="text-blue-600 text-sm" onClick={() => {
                                                    setIsOpen(false);
                                                    router.push('/notifications');
                                                }}>
                                                    Xem tất cả {notifications.length} thông báo
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
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