import { useEffect, useState } from 'react';
import { initSocket } from '@/service/socket';
import { SOCKET_NAMESPACE } from '@/constants/socket.enum';
import { getPersonalTrip } from '@/service/trip.service';
import { Trip } from '@/interface/trip';

const useTripSocket = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const initialTrips = await getPersonalTrip();
                setTrips(initialTrips);
                setLoading(false);
            } catch (err) {
                setError(err as Error);
                setLoading(false);
            }
        };

        const socket = initSocket(SOCKET_NAMESPACE.TRIPS);
        console.log('Attempting to connect to socket...');

        socket.connect();

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });
        socket.on('connect_error', (err) => {
            console.error('Connection error:', err.message);
        });

        socket.on('trip_updated', (updatedTrips: Trip[]) => {
            setTrips(updatedTrips);
        });

        fetchInitialData();

        return () => {
            socket.off('trip_updated');
            socket.disconnect();
        };
    }, []);

    return { data: trips, isLoading: loading, error };
};

export default useTripSocket;