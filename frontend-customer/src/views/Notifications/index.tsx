'use client'

import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { FiBell } from 'react-icons/fi'

import { useNotification } from '@/context/NotificationContext'

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification()
  const router = useRouter()

  // Format time for notifications
  const formatNotificationTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi,
      })
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
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc thông báo')
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    } catch (error) {
      toast.error('Không thể đánh dấu tất cả thông báo là đã đọc')
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <FiBell className="text-green-500" />
            Thông báo
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="rounded-lg border border-blue-200 px-3 py-1 text-sm text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <FiBell className="text-4xl text-gray-400" />
            </div>
            <p className="mb-2 text-gray-500">Không có thông báo nào</p>
            <p className="text-sm text-gray-400">Bạn sẽ nhận được thông báo khi có cập nhật mới</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`cursor-pointer p-4 transition hover:bg-gray-50 ${
                  !notif.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notif._id, notif.redirectUrl)}
              >
                <div className="mb-1 flex items-start justify-between">
                  <p
                    className={`text-base font-medium ${
                      !notif.isRead ? 'text-blue-800' : 'text-gray-800'
                    }`}
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
          </div>
        )}
      </div>
    </div>
  )
}
