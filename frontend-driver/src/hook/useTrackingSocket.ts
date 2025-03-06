import { useEffect, useState, useCallback } from 'react';
import { SOCKET_NAMESPACE } from '~/constants/socket.enum';
import { useAuth } from '~/context/AuthContext';
import { LocationData } from '~/interface/trip';
import { initSocket } from '~/services/socket';

const useTrackingSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<any>(null); // Lưu trữ socket instance
    const { isLogin } = useAuth();
    useEffect(() => {
        let socketInstance;
        const initializeSocket = async () => {
            socketInstance = await initSocket(SOCKET_NAMESPACE.TRACKING);
            if (!socketInstance) return;
            setSocket(socketInstance);
            socketInstance.on('connect', () => setIsConnected(true));
            socketInstance.on('disconnect', () => setIsConnected(false));
        };

        if (isLogin) initializeSocket();

        return () => {
            if (socketInstance) {
                socketInstance.off('connect');
                socketInstance.off('disconnect');
                if (socketInstance.connected) socketInstance.disconnect();
            }
        };
    }, [isLogin]);

    const connect = useCallback(() => {
        console.log('Connecting socket...');
        if (socket && !socket.connected) {
            socket.connect();
            console.log('Socket connected');
        }
    }, [socket]);

    const disconnect = useCallback(() => {
        if (socket && socket.connected) {
            socket.disconnect();
            console.log('Socket disconnected');
        }
    }, [socket]);

    const emitLocationUpdate = useCallback((location: LocationData) => {
        if (socket && socket.connected) {
            console.log('Emitting location update:', location);
            socket.emit('driver_location_update', location);
        } else {
            console.warn('Socket chưa sẵn sàng để gửi vị trí');
        }
    }, [socket]); // Dependency là socket để cập nhật khi socket thay đổi

    return { emitLocationUpdate, connect, disconnect, isConnected };
};

export default useTrackingSocket;