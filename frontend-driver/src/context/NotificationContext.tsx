
import { createContext, useEffect, useState, useContext, } from "react";
import { useAuth } from "~/context/AuthContext";
import useNotificationSocket from "~/hook/useNotificationSocket";
import { INotification } from "~/interface/notification";

interface NotificationContextType {
    notifications: INotification[];
    unreadCount: number;
}
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notificationList, setNotificationList] = useState<INotification[]>([]);
    const [unreadCountNumber, setUnreadCountNumber] = useState<number>(0);
    const { notifications, isLoading, error } = useNotificationSocket();
    const { isLogin } = useAuth();
    useEffect(() => {
        if (isLogin) {
            setNotificationList(notifications);
        }
    }, [notifications, isLogin]);

    useEffect(() => {
        const unreadNotifications: INotification[] = notificationList.filter((notification: INotification) => !notification.isRead);
        setUnreadCountNumber(unreadNotifications.length);
    }, [notificationList])

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