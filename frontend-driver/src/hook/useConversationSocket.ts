import { useEffect, useRef, useState } from 'react';
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
  const [socket, setSocket] = useState<Socket | null>(null)
  const [resetSignal, setResetSignal] = useState(0);
  const { isLogin } = useAuth();

  useEffect(() => {
    console.log('resetSignal', resetSignal);
    if (!isLogin) return;
    let socketInstance: Socket | null = null

    let isMounted = true;

    const fetchInitialData = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        if (id) {
          const conversationDetailData = await getConversationById(id);
          if (isMounted) setConversationDetail(conversationDetailData);
        } else {
          const initialConversations = await getPersonalConversations();
          console.log('initialConversations', initialConversations);
          if (isMounted) setConversations(initialConversations);
        }
      } catch (err) {
        if (isMounted) setError(err as Error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const initializeSocketAndListeners = async () => {
      try {
        socketInstance = await initSocket(SOCKET_NAMESPACE.CONVERSATIONS);
        console.log('socketInstance.id', socketInstance?.id);
        console.log('isMounted', isMounted);
        if (!socketInstance || !isMounted) return;
        setSocket(socketInstance)

        if (id) {
          socketInstance.on('newMessage', (updatedConversation: IConversation) => {
            if (isMounted) setConversationDetail(updatedConversation);
          });
        } else {
          socketInstance.on('conversationsList', (updatedConversations: IConversation[]) => {
            if (isMounted) setConversations(updatedConversations);
          });
          socketInstance.on('newConversation', (newConversation: IConversation) => {
            if (isMounted) setConversations(prev => [newConversation, ...prev]);
          });
        }



        // Xóa các listener cũ trước khi thêm mới
        // socketInstance.off('connect');
        // socketInstance.off('newMessage');
        // socketInstance.off('conversationsList');
        // socketInstance.off('newConversation');

        // socketInstance.on('connect', () => {
        //   console.log('Socket conversation connected:', socketInstance?.id);
        //   fetchInitialData();
        //   if (id && socketInstance) socketInstance.emit('joinConversation', id)
        // });


        if (socketInstance.connected) {
          await fetchInitialData();
          if (id && socketInstance) socketInstance.emit('joinConversation', id)
        } else {
          const onConnect = async () => {
            console.log('Socket conversation connected:', socketInstance?.id);
            await fetchInitialData();
            if (id && socketInstance) socketInstance.emit('joinConversation', id)
            socketInstance?.off('connect', onConnect);
          };
          socketInstance.on('connect', onConnect);
          socketInstance.connect();
        }

        if (!socketInstance.connected) socketInstance.connect()
      } catch (err) {
        if (isMounted) setError(err as Error);
        if (isMounted) setLoading(false);
      }
    };

    initializeSocketAndListeners();

    return () => {
      isMounted = false;

      if (socketInstance) {
        if (id) {
          socketInstance.emit('leaveConversation', id);
          socketInstance.off('newMessage');
        } else {
          socketInstance.off('conversationsList');
          socketInstance.off('newConversation');
        }
        socketInstance.off('connect');
        socketInstance.disconnect();
      }
      setSocket(null)
    };
  }, [isLogin, id, resetSignal]);

  const sendMessage = (conversationId: string, content: string) => {
    if (socket?.connected) {
      socket.emit('sendMessage', { conversationId, content });
    } else {
      console.error('Socket is not connected');
      setError(new Error('Socket is not connected'));
    }
  };

  const refreshData = async () => {
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

  const resetHook = () => setResetSignal(prev => prev + 1);

  return {
    data: id ? conversationDetail : conversations,
    isLoading: loading,
    error,
    sendMessage,
    refreshData,
    resetHook
  };
};

export default useConversationSocket;
