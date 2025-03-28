import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiMenu, FiX, FiUser, FiUserCheck, FiClock, FiLogOut } from 'react-icons/fi'
import { Routes } from '@/constants/routers'
import { Logo } from '@/components/icons/Logo'
import { NotificationDropdown } from '@/components/common/NotificationDropdown'
import { UserDropdown } from '@/components/common/UserDropdown'

interface PrivateHeaderProps {
    userName: string
    notifications: any[]
    unreadCount: number
    onLogout: () => void
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
}

const privateNavItems = [
    { label: 'Trang Chủ', href: Routes.HOME },
    { label: 'Đặt xe theo giờ', href: Routes.RIDE.HOURLY },
    { label: 'Đặt xe theo tuyến cố định', href: Routes.RIDE.ROUTES },
    { label: 'Đặt xe chung', href: Routes.RIDE.SHARED },
    { label: 'Đặt xe điểm đến', href: Routes.RIDE.DESTINATION },
    { label: 'Tính năng', href: Routes.FEATURES },


]

export function PrivateHeader({
    userName,
    notifications,
    unreadCount,
    onLogout,
    markAsRead,
    markAllAsRead,
}: PrivateHeaderProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const router = useRouter()

    const dropdownRef = useRef<HTMLDivElement>(null)
    const notificationRef = useRef<HTMLDivElement>(null)

    const toggleMenu = () => setIsOpen(!isOpen)
    const toggleDropdown = () => setShowDropdown(!showDropdown)
    const toggleNotifications = () => setShowNotifications(!showNotifications)

    const handleMobileNotificationClick = async (notificationId: string, redirectUrl?: string) => {
        try {
            await markAsRead(notificationId)
            if (redirectUrl) {
                router.push(redirectUrl)
            }
            setIsOpen(false)
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            {/* Desktop Navigation */}
            <nav className="flex items-center justify-between bg-white px-4 py-4">
                <Logo size="large" />
                <div className="hidden items-center justify-center space-x-8 md:flex">
                    {privateNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-lg font-medium text-gray-600 transition hover:text-green-500"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className="relative hidden items-center space-x-4 md:flex">
                    <NotificationDropdown
                        notifications={notifications}
                        unreadCount={unreadCount}
                        showNotifications={showNotifications}
                        notificationRef={notificationRef}
                        toggleNotifications={toggleNotifications}
                        markAsRead={markAsRead}
                        markAllAsRead={markAllAsRead}
                    />
                    <UserDropdown
                        userName={userName}
                        showDropdown={showDropdown}
                        dropdownRef={dropdownRef}
                        toggleDropdown={toggleDropdown}
                        onLogout={onLogout}
                    />
                </div>
                <button onClick={toggleMenu} className="text-2xl text-gray-600 md:hidden">
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="fixed bottom-0 left-0 right-0 top-[72px] z-50 overflow-y-auto bg-white shadow-lg md:hidden">
                    <div className="flex max-h-[calc(100vh-72px)] flex-col space-y-4 p-4 pb-20">
                        {/* User Profile Section */}
                        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                <FiUser className="text-xl text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">{userName}</p>
                                <p className="text-xs text-gray-500">Tài khoản của bạn</p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        {privateNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="border-b border-gray-100 py-2 text-lg font-medium text-gray-600 transition hover:text-green-500"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* Notifications Section */}
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-medium text-gray-700">Thông báo</p>
                                {unreadCount > 0 && (
                                    <button
                                        className="text-xs text-blue-600"
                                        onClick={markAllAsRead}
                                    >
                                        Đánh dấu tất cả đã đọc
                                    </button>
                                )}
                            </div>
                            {notifications.length === 0 ? (
                                <p className="py-4 text-center text-sm text-gray-500">
                                    Không có thông báo
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.slice(0, 5).map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`rounded p-3 text-sm ${!notif.isRead ? 'bg-blue-50' : 'bg-gray-50'}`}
                                            onClick={() => handleMobileNotificationClick(notif._id, notif.redirectUrl)}
                                        >
                                            <div className="mb-1 flex items-start justify-between">
                                                <p className={`font-medium ${!notif.isRead ? 'text-blue-800' : 'text-gray-800'}`}>
                                                    {notif.title}
                                                </p>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{notif.message}</p>
                                        </div>
                                    ))}
                                    {notifications.length > 5 && (
                                        <button
                                            className="w-full text-center text-sm text-blue-600"
                                            onClick={() => {
                                                setIsOpen(false)
                                                router.push('/notifications')
                                            }}
                                        >
                                            Xem tất cả {notifications.length} thông báo
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* User Actions */}
                        <div className="flex flex-col space-y-3 border-t border-gray-100 pt-4">
                            <Link
                                href={Routes.PROFILE}
                                className="flex items-center gap-3 py-2 text-gray-600"
                                onClick={() => setIsOpen(false)}
                            >
                                <FiUserCheck className="text-green-500" />
                                <span>Thông tin cá nhân</span>
                            </Link>
                            <Link
                                href={Routes.TRIPS}
                                className="flex items-center gap-3 py-2 text-gray-600"
                                onClick={() => setIsOpen(false)}
                            >
                                <FiClock className="text-green-500" />
                                <span>Lịch sử chuyến đi</span>
                            </Link>
                            <Link
                                href={Routes.BOOKING.ROOT}
                                className="flex items-center gap-3 py-2 text-gray-600"
                                onClick={() => setIsOpen(false)}
                            >
                                <FiClock className="text-green-500" />
                                <span>Lịch sử thanh toán</span>
                            </Link>

                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    onLogout()
                                }}
                                className="flex items-center gap-3 py-2 text-red-600"
                            >
                                <FiLogOut className="text-red-500" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}