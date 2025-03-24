import { createContext, useEffect, useState, useContext, useRef } from "react";
import { useAuth } from "~/context/AuthContext";
import useNotificationSocket from "~/hook/useNotificationSocket";
import { INotification } from "~/interface/notification";
import { markAllNotificationsAsRead, getPersonalNotification } from "~/services/notificationService";

interface NotificationContextType {
    notifications: INotification[];
    unreadCount: number;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
    updateNotificationReadStatus: (id: string, isRead: boolean) => void;
}
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notificationList, setNotificationList] = useState<INotification[]>([]);
    const [unreadCountNumber, setUnreadCountNumber] = useState<number>(0);
    const { notifications = [], isLoading, error, refreshNotifications: refreshSocketNotifications } = useNotificationSocket();
    const { isLogin } = useAuth();
    
    // Sử dụng ref để theo dõi lần xử lý trước đó
    const previousNotificationsRef = useRef<INotification[]>([]);
    
    // Xử lý khi có thông báo mới từ socket
    useEffect(() => {
        // Kiểm tra xem notifications có thay đổi không
        const notificationsChanged = 
            notifications && 
            JSON.stringify(notifications) !== JSON.stringify(previousNotificationsRef.current);
        
        // Chỉ cập nhật khi có thay đổi thực sự
        if (isLogin && notifications && notificationsChanged) {
            previousNotificationsRef.current = notifications;
            
            // Kiểm tra nếu là lần đầu set notifications hoặc notifications rỗng
            if (notificationList.length === 0) {
                setNotificationList(notifications);
                return;
            }
            
            // Tạo map từ notificationList hiện tại để dễ dàng tìm kiếm
            const currentNotificationsMap = new Map(
                notificationList.map(notification => [notification._id, notification])
            );
            
            // Tạo danh sách thông báo mới từ socket, giữ lại trạng thái isRead của thông báo cũ
            const updatedNotifications = notifications.map(newNotification => {
                // Nếu thông báo đã tồn tại, giữ lại trạng thái đọc/chưa đọc
                if (currentNotificationsMap.has(newNotification._id)) {
                    const existingNotification = currentNotificationsMap.get(newNotification._id);
                    return {
                        ...newNotification,
                        isRead: existingNotification?.isRead || false
                    };
                }
                // Nếu là thông báo mới, giữ nguyên trạng thái từ server
                return newNotification;
            });
            
            setNotificationList(updatedNotifications);
        }
    }, [notifications, isLogin, notificationList]);

    // Cập nhật số lượng thông báo chưa đọc
    useEffect(() => {
        // Chỉ tính toán lại khi notificationList thay đổi
        const unreadNotifications = notificationList.filter(notification => !notification.isRead);
        setUnreadCountNumber(unreadNotifications.length);
    }, [notificationList]);

    // Hàm đánh dấu tất cả thông báo là đã đọc
    const markAllAsRead = async (): Promise<void> => {
        try {
            // Gọi API để đánh dấu tất cả là đã đọc
            await markAllNotificationsAsRead();
            
            // Cập nhật state local với tất cả thông báo đã đọc
            setNotificationList(prevList => 
                prevList.map(notification => ({ 
                    ...notification, 
                    isRead: true 
                }))
            );
            
            // Cập nhật số thông báo chưa đọc
            setUnreadCountNumber(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    };

    // Update a single notification's read status
    const updateNotificationReadStatus = (id: string, isRead: boolean) => {
        setNotificationList(prevList => 
            prevList.map(notification => 
                notification._id === id 
                    ? { ...notification, isRead } 
                    : notification
            )
        );
        
        // Recalculate unread count
        if (isRead) {
            setUnreadCountNumber(prev => Math.max(0, prev - 1));
        }
    };

    // Hàm refresh thông báo
    const refreshNotifications = async () => {
        if (isLogin) {
            try {
                const freshNotifications = await getPersonalNotification();
                if (freshNotifications) {
                    setNotificationList(freshNotifications);
                    const unreadCount = freshNotifications.filter(n => !n.isRead).length;
                    setUnreadCountNumber(unreadCount);
                }
            } catch (error) {
                console.error('Error refreshing notifications:', error);
            }
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications: notificationList,
            unreadCount: unreadCountNumber,
            markAllAsRead,
            refreshNotifications,
            updateNotificationReadStatus
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};