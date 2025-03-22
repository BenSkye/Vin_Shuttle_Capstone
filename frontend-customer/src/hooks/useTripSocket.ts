import { useEffect, useState } from 'react';
import { initSocket } from '@/service/socket';
import { SOCKET_NAMESPACE } from '@/constants/socket.enum';
import { getPersonalTrip, getPersonalTripById } from '@/service/trip.service';
import { Trip } from '@/interface/trip';

const useTripSocket = (id?: string) => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [tripDetail, setTripDetail] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                if (id) {
                    const tripDetailData = await getPersonalTripById(id);
                    setTripDetail(tripDetailData);
                } else {
                    const initialTrips = await getPersonalTrip();
                    setTrips(initialTrips);
                }
                setLoading(false);
            } catch (err) {
                setError(err as Error);
                setLoading(false);
            }
        };

        const socket = initSocket(SOCKET_NAMESPACE.TRIPS);

        const handleConnect = () => {
            console.log('Socket connected:', socket.id);
            fetchInitialData();
        };

        console.log('Attempting to connect to socket...');
        if (!socket.connected) {
            socket.connect();
        }

        socket.on('connect', handleConnect);
        socket.on('connect_error', (err) => {
            console.error('Connection error:', err.message);
        });

        if (id) {
            const eventKey = `trip_updated_detail_${id}`;
            console.log(`Listening for: ${eventKey}`);
            socket.on(eventKey, (updatedTrip: Trip) => {
                setTripDetail(updatedTrip);
            });
        } else {
            const eventKey = 'trip_updated';
            socket.on(eventKey, (updatedTrips: Trip[]) => {
                setTrips(updatedTrips);
            });
        }

        fetchInitialData();

        return () => {
            if (id) {
                socket.off(`trip_updated_detail_${id}`);
            } else {
                socket.off('trip_updated');
            }
            console.log('socket disconnected');
            socket.disconnect();
        };
    }, [id]);

    return { data: id ? tripDetail : trips, isLoading: loading, error };
};

export default useTripSocket;