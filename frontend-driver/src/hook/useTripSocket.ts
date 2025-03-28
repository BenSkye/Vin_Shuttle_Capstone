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
        if (!isLogin) return;
        if (!id) {
            if (resetSignal == 0) return;
        }

        let socketInstance: Socket | null = null;

        const initializeSocketAndListeners = async () => {
            try {
                socketInstance = await initSocket(SOCKET_NAMESPACE.TRIPS);
                if (!socketInstance) return;

                // Logic sau khi socket đã sẵn sàng
                const fetchInitialData = async () => {
                    setLoading(true);
                    try {
                        if (id) {
                            const tripDetailData = await getPersonalTripById(id);
                            console.log('tripDetailData', tripDetailData);
                            setTripDetail(tripDetailData);
                        } else {
                            const initialTrips = await getPersonalTrips();
                            setTrips(initialTrips);
                        }
                    } catch (err) {
                        setError(err as Error);
                    } finally {
                        setLoading(false);
                    }
                };

                socketInstance.on('connect', () => {
                    console.log('Socket trip connected:', socketInstance?.id);
                    fetchInitialData();
                });

                if (id) {
                    const eventKey = `trip_updated_detail_${id}`
                    socketInstance.on(eventKey, (updatedTrip: Trip) => {
                        console.log('updatedTrip', updatedTrip);
                        setTripDetail(updatedTrip)
                    })
                } else {
                    const eventKey = 'trip_updated'
                    socketInstance.on(eventKey, (updatedTrips: Trip[]) => {
                        console.log('updatedTrips60', updatedTrips);
                        setTrips(updatedTrips)
                    })
                }

                if (!socketInstance.connected) socketInstance.connect();
            } catch (err) {
                setError(err as Error);
            }
        };

        initializeSocketAndListeners();

        return () => {
            if (socketInstance) {
                if (id) {
                    socketInstance.off(`trip_updated_detail_${id}`)
                } else {
                    socketInstance.off('trip_updated')
                }
                socketInstance.disconnect();
            }
        };
    }, [isLogin, id, resetSignal]);
    const resetHook = () => setResetSignal(prev => prev + 1);

    return { data: id ? tripDetail : trips, isLoading: loading, error, resetHook };
};

export default useTripSocket;
