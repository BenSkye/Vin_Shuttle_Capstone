"use client";

import { useNotification } from "@/context/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function NotificationsPage() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const router = useRouter();

    // Format time for notifications
    const formatNotificationTime = (timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), {
                addSuffix: true,
                locale: vi,
            });
        } catch (error) {
            return "Vừa xong";
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notificationId: string, redirectUrl?: string) => {
        try {
            await markAsRead(notificationId);
            if (redirectUrl) {
                router.push(redirectUrl);
            }
        } catch (error) {
            toast.error("Không thể đánh dấu đã đọc thông báo");
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
        } catch (error) {
            toast.error("Không thể đánh dấu tất cả thông báo là đã đọc");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h1 className="text-xl font-semibold flex items-center gap-2">
                        <FiBell className="text-green-500" />
                        Thông báo
                    </h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <FiBell className="text-gray-400 text-4xl" />
                        </div>
                        <p className="text-gray-500 mb-2">Không có thông báo nào</p>
                        <p className="text-gray-400 text-sm">Bạn sẽ nhận được thông báo khi có cập nhật mới</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`p-4 hover:bg-gray-50 transition cursor-pointer ${!notif.isRead ? "bg-blue-50" : ""
                                    }`}
                                onClick={() => handleNotificationClick(notif._id, notif.redirectUrl)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p
                                        className={`text-base font-medium ${!notif.isRead ? "text-blue-800" : "text-gray-800"
                                            }`}
                                    >
                                        {notif.title}
                                    </p>
                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
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
    );
}