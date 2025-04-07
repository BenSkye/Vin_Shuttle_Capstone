import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { IConversation } from '~/interface/conversation';
import { SOCKET_NAMESPACE } from '~/constants/socket.enum';
import { initSocket } from '~/services/socket';
import { useAuth } from '~/context/AuthContext';
import { Trip } from '~/interface/trip';
import { getPersonalTripById, getPersonalTrips, getSharedItineraryById } from '~/services/tripServices';
import { SharedItinerary } from '~/interface/share-itinerary';

const useSharedItinerarySocket = (id: string) => {
    const [sharedItineraryDetail, setSharedItineraryDetail] = useState<SharedItinerary | null>(null);
    const [updateItineraryMessage, setUpdateItineraryMessage] = useState<string | null>(null);
    const [isTripInItineraryCancel, setIsTripInItineraryCancel] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [resetSignal, setResetSignal] = useState(0);

    const { isLogin } = useAuth();
    useEffect(() => {
        console.log('resetSignalShareItinerary', resetSignal);
        if (!isLogin) return;
        if (!id) {
            return
        }
        let socketInstance: Socket | null = null;

        const initializeSocketAndListeners = async () => {
            try {
                socketInstance = await initSocket(SOCKET_NAMESPACE.SHARE_ITINERARY);
                if (!socketInstance) return;

                // Logic sau khi socket đã sẵn sàng
                const fetchInitialData = async () => {
                    setLoading(true);
                    try {
                        if (id) {
                            const shareItinerary = await getSharedItineraryById(id);
                            setSharedItineraryDetail(shareItinerary);
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
                    const eventKey = `updated_shared_itinerary_${id}`
                    socketInstance.on(eventKey, (data: { sharedItinerary: SharedItinerary, message: string, isTripInItineraryCancel: boolean }) => {
                        console.log('updatedTrip', data.sharedItinerary);
                        setSharedItineraryDetail(data.sharedItinerary)
                        setUpdateItineraryMessage(data.message);
                        setIsTripInItineraryCancel(data.isTripInItineraryCancel);
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
                    socketInstance.off(`updated_shared_itinerary_${id}`)
                }
                socketInstance.disconnect();
            }
        };
    }, [isLogin, id, resetSignal]);
    const resetHook = () => setResetSignal(prev => prev + 1);

    return { data: id ? sharedItineraryDetail : null, updateItineraryMessage, isTripInItineraryCancel, isLoading: loading, error, resetHook };
};

export default useSharedItinerarySocket;
