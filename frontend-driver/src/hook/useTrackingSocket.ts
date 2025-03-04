import { useEffect, useState, useCallback } from 'react';
import { SOCKET_NAMESPACE } from '~/constants/socket.enum';
import { useAuth } from '~/context/AuthContext';
import { initSocket } from '~/services/socket';

const useTrackingSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<any>(null); // Lưu trữ socket instance
    const { isLogin } = useAuth();
    useEffect(() => {
        const initializeSocket = async () => {
            const socketInstance = await initSocket(SOCKET_NAMESPACE.TRACKING);
            if (!socketInstance) {
                console.error('Không thể khởi tạo socket');
                return;
            }
            setSocket(socketInstance);
            setIsConnected(socketInstance.connected);
        };

        if (isLogin) {
            initializeSocket();
        }
    }, [isLogin]);

    const connect = useCallback(() => {
        if (socket && !socket.connected) {
            socket.connect();
            setIsConnected(true);
            console.log('Socket connected');
        }
    }, [socket]);

    const disconnect = useCallback(() => {
        if (socket && socket.connected) {
            socket.disconnect();
            setIsConnected(false);
            console.log('Socket disconnected');
        }
    }, [socket]);

    const emitLocationUpdate = useCallback((location: { latitude: number; longitude: number }) => {
        if (socket && socket.connected) {
            console.log('Emitting location update:', location);
            socket.emit('driver_location_update', {
                lat: location.latitude,
                lng: location.longitude,
            });
        } else {
            console.warn('Socket chưa sẵn sàng để gửi vị trí');
        }
    }, [socket]); // Dependency là socket để cập nhật khi socket thay đổi

    const disconnectTracking = useCallback(() => {
        console.log('Disconnecting socket...');
        if (socket && socket.connected) {
            socket.disconnect();
        }
    });

    return { emitLocationUpdate, connect, disconnect, isConnected };
};

export default useTrackingSocket;