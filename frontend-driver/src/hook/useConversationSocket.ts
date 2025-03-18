import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { IConversation } from '~/interface/conversation';
import { SOCKET_NAMESPACE } from '~/constants/socket.enum';
import { initSocket } from '~/services/socket';
import { useAuth } from '~/context/AuthContext';
import { getConversationById, getPersonalConversations } from '~/services/conversationService';

const useConversationSocket = (id?: string) => {
    const [conversations, setConversations] = useState<IConversation[]>([]);
    const [conversationDetail, setConversationDetail] = useState<IConversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const { isLogin } = useAuth();
    useEffect(() => {
        if (!isLogin) return;

        let socketInstance: Socket | null = null;

        const initializeSocketAndListeners = async () => {
            try {
                socketInstance = await initSocket(SOCKET_NAMESPACE.CONVERSATIONS);
                if (!socketInstance) return;
                setSocket(socketInstance);

                // Logic sau khi socket đã sẵn sàng
                const fetchInitialData = async () => {
                    setLoading(true);
                    try {
                        if (id) {
                            const conversationDetailData = await getConversationById(id);
                            setConversationDetail(conversationDetailData);
                        } else {
                            const initialConversations = await getPersonalConversations();
                            setConversations(initialConversations);
                        }
                    } catch (err) {
                        setError(err as Error);
                    } finally {
                        setLoading(false);
                    }
                };

                socketInstance.on('connect', () => {
                    console.log('Socket conversation connected:', socketInstance?.id);
                    fetchInitialData();
                    if (id && socketInstance) socketInstance.emit('joinConversation', id);
                });

                if (id) {
                    socketInstance.on('newMessage', (updatedConversation: IConversation) => {
                        console.log('newMessage', updatedConversation);
                        setConversationDetail(updatedConversation);
                    });
                } else {
                    socketInstance.on('conversationsList', (updatedConversations: IConversation[]) => {
                        setConversations(updatedConversations);
                    });
                    socketInstance.on('newConversation', (newConversation: IConversation) => {
                        setConversations((prev) => [newConversation, ...prev]);
                    });
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
                    socketInstance.emit('leaveConversation', id);
                    socketInstance.off('newMessage');
                } else {
                    socketInstance.off('conversationsList');
                    socketInstance.off('newConversation');
                }
                socketInstance.disconnect();
            }
        };
    }, [isLogin, id]);

    const sendMessage = (conversationId: string, content: string) => {
        if (socket && socket.connected) {
            socket.emit('sendMessage', { conversationId, content });
        } else {
            console.error('Socket is not connected');
            setError(new Error('Socket is not connected'));
        }
    };

    return { data: id ? conversationDetail : conversations, isLoading: loading, error, sendMessage };
};

export default useConversationSocket;