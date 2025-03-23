'use client'

import { useEffect, useRef, useState } from 'react'

import { Badge } from 'antd'
// Import useNotification
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { FiBell, FiClock, FiLogOut, FiMenu, FiUser, FiUserCheck, FiX } from 'react-icons/fi'

import { useAuth } from '../../../../context/AuthContext'
import { useNotification } from '../../../../context/NotificationContext'
import { Logo } from './Logo'
import { Routes } from '@/constants/routers'

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
  const [userName, setUserName] = useState<string>('Người dùng')

  // Update local state whenever authUser changes
  useEffect(() => {
    if (authUser && authUser.name) {
      setUserName(authUser.name)
    } else if (isLoggedIn) {
      setUserName('Người dùng')
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
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout() // Use logout from AuthContext
    setShowDropdown(false)
    router.push('/login')
  }

  const toggleMenu = () => setIsOpen(!isOpen)
  const toggleNotifications = () => setShowNotifications(!showNotifications)

  const navItems = [
    { label: 'Trang Chủ', href: Routes.HOME },
    { label: 'Đặt xe theo giờ', href: Routes.RIDE.HOURLY },
    { label: 'Đặt xe theo tuyến cố định', href: Routes.RIDE.ROUTES },
    { label: 'Đặt xe điểm đến', href: Routes.RIDE.DESTINATION },
    { label: 'Tính năng', href: Routes.FEATURES },
  ]

  // Format time for notifications
  const formatNotificationTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: vi })
    } catch (error) {
      return 'Vừa xong'
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notificationId: string, redirectUrl?: string) => {
    try {
      await markAsRead(notificationId)

      if (redirectUrl) {
        router.push(redirectUrl)
      }
      setShowNotifications(false)
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc thông báo')
    }
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
      // Let the socket update the state
    } catch (error) {
      toast.error('Không thể đánh dấu tất cả thông báo là đã đọc')
    }
  }

  const AuthButtons = () =>
    isLoggedIn ? (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 shadow-md ring-2 ring-green-100">
            <FiUser className="text-xl text-white" />
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-gray-700">{userName}</p>
            <p className="text-xs text-gray-500">Tài khoản của bạn</p>
          </div>
        </button>

        {showDropdown && (
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-green-50"
            >
              <FiUserCheck className="text-green-500" />
              <span>Thông tin cá nhân</span>
            </Link>
            <Link
              href="/trips"
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-green-50"
            >
              <FiClock className="text-green-500" />
              <span>Lịch sử chuyến đi</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
            >
              <FiLogOut className="text-red-500" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    ) : (
      <>
        <Link
          href="/login"
          className="text-lg font-medium text-gray-600 transition hover:text-green-500"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-green-500 px-4 py-2 text-lg font-medium text-white transition hover:bg-green-600"
        >
          Đăng ký
        </Link>
      </>
    )

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="flex items-center justify-between bg-white px-4 py-4">
        <Logo size="large" />
        <div className="hidden items-center justify-center space-x-8 md:flex">
          {navItems.map((item) => (
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
          {isLoggedIn && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotifications}
                className="relative text-2xl text-gray-600 hover:text-green-500"
              >
                <Badge count={unreadCount} overflowCount={99}>
                  <FiBell />
                </Badge>
              </button>
              {showNotifications && (
                <div className="absolute right-0 z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                  <div className="flex items-center justify-between border-b px-4 py-2">
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
                        <FiBell className="text-3xl text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">Không có thông báo</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`cursor-pointer border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50' : ''}`}
                          onClick={() => handleNotificationClick(notif._id, notif.redirectUrl)}
                        >
                          <div className="mb-1 flex items-start justify-between">
                            <p
                              className={`text-sm font-medium ${!notif.isRead ? 'text-blue-800' : 'text-gray-800'}`}
                            >
                              {notif.title}
                            </p>
                            <span className="ml-2 whitespace-nowrap text-xs text-gray-500">
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
        <button onClick={toggleMenu} className="text-2xl text-gray-600 md:hidden">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </nav>
      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 top-[72px] z-50 overflow-y-auto bg-white shadow-lg md:hidden">
          <div className="flex max-h-[calc(100vh-72px)] flex-col space-y-4 p-4 pb-20">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-gray-100 py-2 text-lg font-medium text-gray-600 transition hover:text-green-500"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
              <div className="pt-2">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-gray-700">Thông báo</p>
                  {unreadCount > 0 && (
                    <span className="text-xs text-blue-600" onClick={handleMarkAllAsRead}>
                      Đánh dấu tất cả đã đọc
                    </span>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">Không có thông báo</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif._id}
                        className={`rounded p-3 text-sm ${!notif.isRead ? 'bg-blue-50' : 'bg-gray-50'}`}
                        onClick={() => handleNotificationClick(notif._id, notif.redirectUrl)}
                      >
                        <div className="mb-1 flex items-start justify-between">
                          <p
                            className={`font-medium ${!notif.isRead ? 'text-blue-800' : 'text-gray-800'}`}
                          >
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
                      <div className="mt-2 text-center">
                        <button
                          className="text-sm text-blue-600"
                          onClick={() => {
                            setIsOpen(false)
                            router.push('/notifications')
                          }}
                        >
                          Xem tất cả {notifications.length} thông báo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col space-y-3 border-t border-gray-100 pt-4">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                      <FiUser className="text-xl text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">{userName}</p>
                      <p className="text-xs text-gray-500">Tài khoản của bạn</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 py-2 text-gray-600"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiUserCheck className="text-green-500" />
                    <span>Thông tin cá nhân</span>
                  </Link>
                  <Link
                    href="/trips"
                    className="flex items-center gap-3 py-2 text-gray-600"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiClock className="text-green-500" />
                    <span>Lịch sử chuyến đi</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-2 text-red-600"
                  >
                    <FiLogOut className="text-red-500" />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/login"
                    className="rounded-lg border border-gray-200 py-2 text-center text-gray-600 hover:text-green-500"
                    onClick={() => setIsOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-green-500 py-2 text-center text-white hover:bg-green-600"
                    onClick={() => setIsOpen(false)}
                  >
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
