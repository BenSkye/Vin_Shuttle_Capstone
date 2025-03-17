import { useEffect, useState, useCallback } from 'react';
import { SOCKET_NAMESPACE } from '~/constants/socket.enum';
import { useAuth } from '~/context/AuthContext';
import { INotification } from '~/interface/notification';
import { getPersonalNotification } from '~/services/notificationService';
import { initSocket } from '~/services/socket';



const useNotificationSocket = () => {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [socket, setSocket] = useState<any>(null);
    const [error, setError] = useState<Error | null>(null);
    const { isLogin } = useAuth();

    useEffect(() => {
        let socketInstance: any;

        const initializeSocket = async () => {
            try {
                socketInstance = await initSocket(SOCKET_NAMESPACE.NOTIFICATIONS);
                if (!socketInstance) return;
                setSocket(socketInstance);
            } catch (err) {
                console.error('Failed to initialize socket:', err);
                setError(err as Error);
            }
        };

        if (isLogin) {
            initializeSocket();
        }

        // Cleanup khi component unmount hoặc isLogin thay đổi
        return () => {
            if (socketInstance) {
                console.log('Disconnecting socket...');
                socketInstance.disconnect();
            }
        };
    }, [isLogin]);

    useEffect(() => {

        if (!socket || !isLogin) return;

        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const notificationData = await getPersonalNotification();
                console.log('Notification data:', notificationData);
                setNotifications(notificationData);

                // Calculate unread count


                setLoading(false);
            } catch (err) {
                setError(err as Error);
                setLoading(false);
            }
        };

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
            // setUnreadCount(prevCount => prevCount + 1);
        });

        // // Listen for unread count updates
        // socket.on('unread_notification_count', (data: { count: number }) => {
        //     setUnreadCount(data.count);
        // });

        fetchInitialData();

        return () => {
            socket.off('new_notification');
            socket.off('unread_notification_count');
            console.log('Notification socket disconnected');
            socket.disconnect();
        };
    }, [socket, isLogin]);

    return {
        notifications,
        isLoading: loading,
        error
    };
};

export default useNotificationSocket;