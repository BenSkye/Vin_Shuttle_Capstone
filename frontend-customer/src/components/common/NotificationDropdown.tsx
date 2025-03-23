import { Badge } from 'antd'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { FiBell } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface NotificationDropdownProps {
    notifications: any[]
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

    const formatNotificationTime = (timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: vi })
        } catch (error) {
            return 'Vừa xong'
        }
    }

    const handleNotificationClick = async (notificationId: string, redirectUrl?: string) => {
        try {
            await markAsRead(notificationId)
            if (redirectUrl) {
                router.push(redirectUrl)
            }
            toggleNotifications()
        } catch (error) {
            toast.error('Không thể đánh dấu đã đọc thông báo')
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead()
            toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
        } catch (error) {
            toast.error('Không thể đánh dấu tất cả thông báo là đã đọc')
        }
    }

    return (
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
                    {/* Notification header */}
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

                    {/* Notification list */}
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
                                        <p className={`text-sm font-medium ${!notif.isRead ? 'text-blue-800' : 'text-gray-800'}`}>
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
            )}
        </div>
    )
}