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
        console.log('Attempting to connect to socket...');

        socket.connect();

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });
        socket.on('connect_error', (err) => {
            console.error('Connection error:', err.message);
        });

        if (id) {
            socket.on(`trip_updated_detail_${id}`, (updatedTrip: Trip) => {
                setTripDetail(updatedTrip);
            });
        } else {
            socket.on('trip_updated', (updatedTrips: Trip[]) => {
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
            socket.disconnect();
        };
    }, [id]);

    return { data: id ? tripDetail : trips, isLoading: loading, error };
};

export default useTripSocket;