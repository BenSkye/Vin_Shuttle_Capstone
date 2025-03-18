'use client';
import useNotificationSocket from "@/hooks/useNotificationSocket";
import { INotification } from "@/interface/notification";
import { createContext, useEffect, useState, useContext, } from "react";

interface NotificationContextType {
    notifications: INotification[];
    unreadCount: number;
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

    useEffect(() => {
        console.log('Notification list:', notificationList);
        console.log('Unread count:', unreadCountNumber);
    }, [notificationList, unreadCountNumber]);

    return (
        <NotificationContext.Provider value={{
            notifications: notificationList,
            unreadCount: unreadCountNumber
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