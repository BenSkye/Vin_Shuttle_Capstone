import { useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiBell,
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiUser,
  FiUserCheck,
  FiX,
} from 'react-icons/fi'

import { Routes } from '@/constants/routers'

import { NotificationDropdown } from '@/components/common/NotificationDropdown'
import { UserDropdown } from '@/components/common/UserDropdown'
import { Logo } from '@/components/icons/Logo'

import { INotification } from '@/interface/notification'

interface PrivateHeaderProps {
  userName: string
  notifications: INotification[]
  unreadCount: number
  onLogout: () => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const privateNavItems = [
  { label: 'Trang Chủ', href: Routes.HOME },
  {
    label: 'Đặt xe',
    items: [
      { label: 'Đặt xe theo giờ', href: Routes.RIDE.HOURLY },
      { label: 'Đặt xe theo tuyến', href: Routes.RIDE.ROUTES },
      { label: 'Đặt xe chung', href: Routes.RIDE.SHARED },
      { label: 'Đặt xe điểm đến', href: Routes.RIDE.DESTINATION },
    ],
  },
  { label: 'Xe bus', href: Routes.RIDE.BUS },
  { label: 'Giới thiệu', href: Routes.ABOUT },
]

const userMenuItems = [
  { label: 'Thông tin cá nhân', href: Routes.PROFILE, icon: FiUserCheck },
  { label: 'Lịch sử cuốc xe', href: Routes.TRIPS, icon: FiClock },
  { label: 'Lịch sử thanh toán', href: Routes.BOOKING.ROOT, icon: FiCreditCard },
  { label: 'Cuộc trò chuyện', href: Routes.CHAT, icon: FiMessageSquare },
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
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const router = useRouter()

  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Add padding to body to account for fixed header
  useEffect(() => {
    document.body.style.paddingTop = '72px'
    return () => {
      document.body.style.paddingTop = '0'
    }
  }, [])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const toggleMenu = () => setIsOpen(!isOpen)
  const toggleDropdown = () => setShowDropdown(!showDropdown)
  const toggleNotifications = () => setShowNotifications(!showNotifications)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    )
  }

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
    <>
      <header className="bg-surface/98 fixed left-0 right-0 top-0 z-[9999] border-b border-divider shadow-sm backdrop-blur-md">
        <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 lg:px-8">
          {/* Left Section - Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-[240px] py-2"
          >
            <Logo size="large" />
          </motion.div>

          {/* Center Section - Navigation */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex items-center space-x-2">
              {privateNavItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
                >
                  {item.items ? (
                    <div className="group relative">
                      <button className="flex items-center rounded-lg px-4 py-2 text-base font-medium text-content-secondary transition-all hover:bg-surface-secondary hover:text-primary-500">
                        {item.label}
                        <FiChevronDown className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                      </button>
                      <div className="absolute -bottom-2 left-0 right-0 h-4 bg-transparent" />
                      <div className="invisible absolute left-0 top-[calc(100%-8px)] z-[9990] min-w-[240px] rounded-lg border border-divider bg-surface py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="flex w-full items-center px-4 py-2.5 text-content-secondary transition-colors hover:bg-surface-secondary hover:text-primary-500"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="rounded-lg px-4 py-2 text-base font-medium text-content-secondary transition-all hover:bg-surface-secondary hover:text-primary-500"
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="relative hidden w-[280px] items-center justify-end space-x-2 md:flex">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="rounded-lg p-2.5 transition-all duration-200 hover:bg-surface-secondary"
            >
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                showNotifications={showNotifications}
                notificationRef={notificationRef}
                toggleNotifications={toggleNotifications}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="rounded-lg transition-colors hover:bg-surface-secondary"
            >
              <UserDropdown
                userName={userName}
                showDropdown={showDropdown}
                dropdownRef={dropdownRef}
                toggleDropdown={toggleDropdown}
                onLogout={onLogout}
              />
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="rounded-lg p-2 text-2xl text-content-secondary transition-colors hover:bg-surface-secondary hover:text-primary-500 md:hidden"
            aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] backdrop-blur-sm md:hidden"
            onClick={toggleMenu}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-[72px] z-[9998] h-[calc(100vh-72px)] w-[75%] overflow-y-auto bg-surface shadow-xl md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col p-4 pb-20">
                {/* User Profile Section */}
                <div className="mb-4 flex items-center space-x-3 border-b border-divider pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500">
                    <FiUser className="text-xl text-content-inverse" />
                  </div>
                  <div>
                    <p className="font-medium text-content">{userName}</p>
                    <p className="text-xs text-content-tertiary">Tài khoản của bạn</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2">
                  {privateNavItems.map((item) => (
                    <div key={item.label}>
                      {item.items ? (
                        <div className="border-b border-divider">
                          <button
                            onClick={() => toggleSection(item.label)}
                            className="flex w-full items-center justify-between py-3 text-lg font-medium text-content-secondary"
                          >
                            <span>{item.label}</span>
                            <FiChevronDown
                              className={`h-5 w-5 transition-transform ${expandedSections.includes(item.label) ? 'rotate-180' : ''
                                }`}
                            />
                          </button>
                          <AnimatePresence>
                            {expandedSections.includes(item.label) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-4 space-y-2 pb-3">
                                  {item.items.map((subItem) => (
                                    <Link
                                      key={subItem.href}
                                      href={subItem.href}
                                      className="block py-2 text-content-secondary hover:text-primary-500"
                                      onClick={() => setIsOpen(false)}
                                    >
                                      {subItem.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className="block border-b border-divider py-3 text-lg font-medium text-content-secondary"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Notifications Section */}
                <button
                  onClick={() => toggleSection('notifications')}
                  className="mt-4 flex w-full items-center justify-between border-b border-divider py-3"
                >
                  <div className="flex items-center">
                    <FiBell className="mr-2 text-primary-500" />
                    <span className="text-lg font-medium text-content-secondary">Thông báo</span>
                  </div>
                  <FiChevronDown
                    className={`h-5 w-5 transition-transform ${expandedSections.includes('notifications') ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedSections.includes('notifications') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 py-3">
                        {unreadCount > 0 && (
                          <button className="text-xs text-accent-500" onClick={markAllAsRead}>
                            Đánh dấu tất cả đã đọc
                          </button>
                        )}
                        {notifications.length === 0 ? (
                          <p className="py-2 text-center text-sm text-content-tertiary">
                            Không có thông báo
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {notifications.slice(0, 5).map((notif) => (
                              <div
                                key={notif._id}
                                className={`rounded p-3 text-sm ${!notif.isRead ? 'bg-accent-50' : 'bg-surface-secondary'}`}
                                onClick={() =>
                                  handleMobileNotificationClick(notif._id, notif.redirectUrl)
                                }
                              >
                                <div className="mb-1 flex items-start justify-between">
                                  <p
                                    className={`font-medium ${!notif.isRead ? 'text-accent-700' : 'text-content'}`}
                                  >
                                    {notif.title}
                                  </p>
                                  <span className="text-xs text-content-tertiary">
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-content-secondary">{notif.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* User Actions */}
                <button
                  onClick={() => toggleSection('userActions')}
                  className="mt-2 flex w-full items-center justify-between border-b border-divider py-3"
                >
                  <div className="flex items-center">
                    <FiUser className="mr-2 text-primary-500" />
                    <span className="text-lg font-medium text-content-secondary">Tài khoản</span>
                  </div>
                  <FiChevronDown
                    className={`h-5 w-5 transition-transform ${expandedSections.includes('userActions') ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedSections.includes('userActions') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 py-3">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 py-2 text-content-secondary"
                            onClick={() => setIsOpen(false)}
                          >
                            <item.icon className="text-primary-500" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                        <button
                          onClick={() => {
                            setIsOpen(false)
                            onLogout()
                          }}
                          className="flex w-full items-center gap-3 py-2 text-error"
                        >
                          <FiLogOut className="text-error" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
