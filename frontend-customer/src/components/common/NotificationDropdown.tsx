import { useEffect, useState } from 'react'

import { Badge } from 'antd'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { FiBell } from 'react-icons/fi'

interface NotificationDropdownProps {
  notifications: {
    _id: string
    title: string
    body: string
    isRead: boolean
    createdAt: string
    redirectUrl?: string
  }[]
  unreadCount: number
  showNotifications: boolean
  notificationRef: React.RefObject<HTMLDivElement>
  toggleNotifications: () => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  showNotifications,
  notificationRef,
  toggleNotifications,
  markAsRead,
  markAllAsRead,
}: NotificationDropdownProps) {
  const router = useRouter()
  const [formattedDates, setFormattedDates] = useState<{ [key: string]: string }>({})

  // Move date formatting to client-side only
  useEffect(() => {
    const dates: { [key: string]: string } = {}
    notifications.forEach((notif) => {
      try {
        dates[notif._id] = formatDistanceToNow(new Date(notif.createdAt), {
          addSuffix: true,
          locale: vi,
        })
      } catch {
        dates[notif._id] = 'Vừa xong'
      }
    })
    setFormattedDates(dates)
  }, [notifications])

  const handleNotificationClick = async (notificationId: string, redirectUrl?: string) => {
    try {
      await markAsRead(notificationId)
      if (redirectUrl) {
        router.push(redirectUrl)
      }
      toggleNotifications()
    } catch {
      toast.error('Không thể đánh dấu đã đọc thông báo')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    } catch {
      toast.error('Không thể đánh dấu tất cả thông báo là đã đọc')
    }
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={toggleNotifications}
        className="relative flex h-12 w-12 items-center justify-center rounded-lg text-content-secondary transition-colors hover:text-primary-500"
        aria-label="Thông báo"
      >
        <Badge
          count={unreadCount}
          overflowCount={99}
          className="flex items-center justify-center"
          offset={[-2, 2]}
        >
          <FiBell className="h-6 w-6" />
        </Badge>
      </button>
      {showNotifications && (
        <div className="absolute right-0 z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-xl border border-divider bg-surface py-2 shadow-xl">
          {/* Notification header */}
          <div className="flex items-center justify-between border-b border-divider px-4 py-2">
            <p className="text-sm font-medium text-content">Thông báo</p>
            {unreadCount > 0 && (
              <button
                className="text-sm text-accent-500 hover:text-accent-600"
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="mb-3 flex justify-center">
                <FiBell className="text-3xl text-content-tertiary" />
              </div>
              <p className="text-sm text-content-tertiary">Không có thông báo</p>
            </div>
          ) : (
            <div>
              {notifications.map((notif) => (
                <button
                  key={notif._id}
                  type="button"
                  className={`w-full cursor-pointer border-b border-divider px-4 py-3 text-left transition hover:bg-surface-secondary ${!notif.isRead ? 'bg-accent-50' : ''}`}
                  onClick={() => handleNotificationClick(notif._id, notif.redirectUrl)}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <p
                      className={`text-sm font-medium ${!notif.isRead ? 'text-accent-700' : 'text-content'}`}
                    >
                      {notif.title}
                    </p>
                    <span className="ml-2 whitespace-nowrap text-xs text-content-tertiary">
                      {formattedDates[notif._id] || 'Vừa xong'}
                    </span>
                  </div>
                  <p className="text-sm text-content-secondary">{notif.body}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
