import { useEffect, useState } from 'react';
import { initSocket } from '@/service/socket';
import { SOCKET_NAMESPACE } from '@/constants/socket.enum';
import { getPersonalNotification } from '@/service/notification.service';
import { INotification } from '@/interface/notification';
import { useAuth } from '@/context/AuthContext';


const useNotificationSocket = () => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const { isLoggedIn } = useAuth();
    useEffect(() => {
        console.log('useNotificationSocket effect');
        if (!isLoggedIn) return;
        console.log('useNotificationSocket effect after check isLoggedIn');
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const notificationData = await getPersonalNotification();
                setNotifications(notificationData);

                // Calculate unread count
                const unreadNotifications = notificationData.filter(notification => !notification.isRead);
                setUnreadCount(unreadNotifications.length);

                setLoading(false);
            } catch (err) {
                setError(err as Error);
                setLoading(false);
            }
        };

        const socket = initSocket(SOCKET_NAMESPACE.NOTIFICATIONS);

        const handleConnect = () => {
            console.log('Notification socket connected:', socket.id);
            fetchInitialData();
        };

        console.log('Attempting to connect to notification socket...');
        if (!socket.connected) {
            socket.connect();
        }

        socket.on('connect', handleConnect);
        socket.on('connect_error', (err) => {
            console.error('Notification connection error:', err.message);
        });

        // Listen for new notifications
        socket.on('new_notification', (newNotification: INotification) => {
            setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
            setUnreadCount(prevCount => prevCount + 1);
        });

        // Listen for unread count updates
        socket.on('unread_notification_count', (data: { count: number }) => {
            setUnreadCount(data.count);
        });

        fetchInitialData();

        return () => {
            socket.off('new_notification');
            socket.off('unread_notification_count');
            console.log('Notification socket disconnected');
            socket.disconnect();
        };
    }, [isLoggedIn]);

    return {
        notifications,
        unreadCount,
        isLoading: loading,
        error
    };
};

export default useNotificationSocket;