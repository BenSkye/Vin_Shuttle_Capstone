import { useEffect, useState } from 'react';
import { initSocket } from '@/service/socket';
import { SOCKET_NAMESPACE } from '@/constants/socket.enum';

const useTrackingSocket = (vehicleId?: string) => {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const socket = initSocket(SOCKET_NAMESPACE.TRACKING);

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

        const requestLocation = async () => {

        }

        if (vehicleId) {
            const eventKey = `update_location_${vehicleId}`;
            console.log(`Listening for: ${eventKey}`);
            socket.on(eventKey, (updatedLocation: { lat: number; lng: number }) => {
                setLocation(updatedLocation);
            })
        }

        return () => {
            if (vehicleId) {
                socket.off(`update_location_${vehicleId}`);
            }
            socket.disconnect();
        };
    }, [vehicleId]);

    return { data: location, isLoading: loading };
};

export default useTrackingSocket;