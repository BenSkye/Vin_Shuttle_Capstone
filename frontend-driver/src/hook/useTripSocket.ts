import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { IConversation } from '~/interface/conversation';
import { SOCKET_NAMESPACE } from '~/constants/socket.enum';
import { initSocket } from '~/services/socket';
import { useAuth } from '~/context/AuthContext';
import { Trip } from '~/interface/trip';
import { getPersonalTripById, getPersonalTrips } from '~/services/tripServices';

const useTripSocket = (id?: string) => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [tripDetail, setTripDetail] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [resetSignal, setResetSignal] = useState(0);

    const { isLogin } = useAuth();
    useEffect(() => {
        console.log('resetSignal', resetSignal);
        console.log('isLogin20', isLogin);
        console.log('id21', id);
        if (!isLogin) return;
        // if (!id) {
        //     if (resetSignal == 0) return;
        // }

        let socketInstance: Socket | null = null;
        let isMounted = true;

        const initializeSocketAndListeners = async () => {
            try {
                socketInstance = await initSocket(SOCKET_NAMESPACE.TRIPS);
                console.log('socketInstance', socketInstance);
                if (!socketInstance || !isMounted) return;
                // Logic sau khi socket đã sẵn sàng

                if (id) {
                    const eventKey = `trip_updated_detail_${id}`
                    socketInstance.on(eventKey, (updatedTrip: Trip) => {
                        console.log('updatedTrip', updatedTrip);
                        if (isMounted) setTripDetail(updatedTrip);
                    })
                } else {
                    const eventKey1 = 'trip_updated'
                    const eventkey2 = 'new_trip'
                    socketInstance.on(eventKey1, (updatedTrips: Trip[]) => {
                        console.log('updatedTrips60', updatedTrips);
                        if (isMounted) setTrips(updatedTrips);
                    })
                    socketInstance.on(eventkey2, (newTrip: Trip) => {
                        console.log('newTrip51', newTrip);
                        //if trips have newTrip, do not add it to trips
                        if (trips.some(trip => trip._id === newTrip._id)) return;
                        if (isMounted) setTrips(prevTrips => [newTrip, ...prevTrips]);
                    })
                }

                const fetchInitialData = async () => {
                    if (!isMounted) return;
                    setLoading(true);
                    console.log('Fetching initial data...');
                    try {
                        if (id) {
                            console.log('Fetching trip detail for ID:', id)
                            const tripDetailData = await getPersonalTripById(id);
                            console.log('tripDetailData', tripDetailData);
                            if (isMounted) setTripDetail(tripDetailData);
                        } else {
                            const initialTrips = await getPersonalTrips();
                            if (isMounted) setTrips(initialTrips);
                        }
                    } catch (err) {
                        if (isMounted) setError(err as Error);
                    } finally {
                        if (isMounted) setLoading(false);
                    }
                };


                if (socketInstance.connected) {
                    await fetchInitialData();
                } else {
                    const onConnect = () => {
                        console.log('Socket Trip connected:', socketInstance?.id);
                        fetchInitialData();
                        socketInstance?.off('connect', onConnect);
                    };
                    socketInstance.on('connect', onConnect);
                    socketInstance.connect();
                }


                if (!socketInstance.connected) socketInstance.connect();
            } catch (err) {
                if (isMounted) setError(err as Error);
                if (isMounted) setLoading(false);
            }
        };

        initializeSocketAndListeners();

        return () => {
            if (socketInstance) {
                if (id) {
                    console.log('Disconnecting socket for trip detail...');
                    socketInstance.off(`trip_updated_detail_${id}`)
                } else {
                    socketInstance.off('trip_updated')
                }
                socketInstance.off('connect');
                socketInstance.disconnect();
            }
        };
    }, [isLogin, id, resetSignal]);

    const resetHook = () => setResetSignal(prev => prev + 1);

    return { data: id ? tripDetail : trips, isLoading: loading, error, resetHook };
};

export default useTripSocket;
