'use client';
import useNotificationSocket from "@/hooks/useNotificationSocket";
import { INotification } from "@/interface/notification";
import { createContext, useEffect, useState, useContext, useCallback } from "react";
import { markAsReadNotification, markAllAsReadNotification } from "@/service/notification.service";

interface NotificationContextType {
    notifications: INotification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notificationList, setNotificationList] = useState<INotification[]>([]);
    const [unreadCountNumber, setUnreadCountNumber] = useState<number>(0);
    const { notifications, unreadCount, isLoading, error } = useNotificationSocket();

    useEffect(() => {
        setNotificationList(notifications);
        setUnreadCountNumber(unreadCount);
    }, [notifications, unreadCount]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await markAsReadNotification(id);

            // Update local state
            setNotificationList(prev =>
                prev.map(notif => notif._id === id ? { ...notif, isRead: true } : notif)
            );

            setUnreadCountNumber(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            throw error;
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await markAllAsReadNotification();

            // Update local state
            setNotificationList(prev =>
                prev.map(notif => ({ ...notif, isRead: true }))
            );

            setUnreadCountNumber(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            throw error;
        }
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications: notificationList,
            unreadCount: unreadCountNumber,
            markAsRead,
            markAllAsRead
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