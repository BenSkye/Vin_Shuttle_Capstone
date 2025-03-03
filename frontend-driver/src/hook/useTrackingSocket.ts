import { useEffect, useState, useCallback } from 'react';
import { SOCKET_NAMESPACE } from '~/constants/socket.enum';
import { initSocket } from '~/services/socket';

const useTrackingSocket = () => {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeSocket = async () => {
            const socket = await initSocket(SOCKET_NAMESPACE.TRACKING);

            const handleConnect = () => {
                console.log('Socket connected:', socket.id);
            };

            console.log('Attempting to connect to socket...');
            if (!socket.connected) {
                socket.connect();
            }

            socket.on('connect', handleConnect);
            socket.on('connect_error', (err) => {
                console.error('Connection error:', err.message);
            });

            return () => {
                socket.disconnect();
            };
        };

        initializeSocket();
    }, []);

    const emitLocationUpdate = useCallback(async (location: { latitude: number; longitude: number }) => {
        const socket = await initSocket(SOCKET_NAMESPACE.TRACKING);
        console.log('Emitting location update:', location);
        socket.emit('driver_location_update', {
            lat: location.latitude,
            lng: location.longitude,
        });
    }, []);

    return { data: location, isLoading: loading, emitLocationUpdate };
};

export default useTrackingSocket;