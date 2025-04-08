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
  const socketRef = useRef<Socket | null>(null);
  const { isLogin } = useAuth();

  useEffect(() => {
    if (!isLogin) return;

    let isMounted = true;

    const initializeSocketAndListeners = async () => {
      try {
        // Chỉ khởi tạo socket nếu chưa có hoặc đã disconnect
        if (!socketRef.current || !socketRef.current.connected) {
          const socketInstance = await initSocket(SOCKET_NAMESPACE.CONVERSATIONS);
          if (!socketInstance || !isMounted) return;
          socketRef.current = socketInstance;
        }

        const socket = socketRef.current;

        const fetchInitialData = async () => {
          if (!isMounted) return;
          setLoading(true);
          try {
            if (id) {
              const conversationDetailData = await getConversationById(id);
              if (isMounted) setConversationDetail(conversationDetailData);
            } else {
              const initialConversations = await getPersonalConversations();
              if (isMounted) setConversations(initialConversations);
            }
          } catch (err) {
            if (isMounted) setError(err as Error);
          } finally {
            if (isMounted) setLoading(false);
          }
        };

        // Xóa các listener cũ trước khi thêm mới
        socket.off('connect');
        socket.off('newMessage');
        socket.off('conversationsList');
        socket.off('newConversation');

        socket.on('connect', () => {
          console.log('Socket conversation connected:', socket.id);
          fetchInitialData();
          if (id) socket.emit('joinConversation', id);
        });

        if (id) {
          socket.on('newMessage', (updatedConversation: IConversation) => {
            if (isMounted) setConversationDetail(updatedConversation);
          });
        } else {
          socket.on('conversationsList', (updatedConversations: IConversation[]) => {
            if (isMounted) setConversations(updatedConversations);
          });
          socket.on('newConversation', (newConversation: IConversation) => {
            if (isMounted) setConversations(prev => [newConversation, ...prev]);
          });
        }

        // Nếu đã connect sẵn thì fetch data ngay
        if (socket.connected) {
          fetchInitialData();
          if (id) socket.emit('joinConversation', id);
        } else {
          socket.connect();
        }

      } catch (err) {
        if (isMounted) setError(err as Error);
        if (isMounted) setLoading(false);
      }
    };

    initializeSocketAndListeners();

    return () => {
      isMounted = false;
      // Không disconnect socket ở đây để giữ kết nối khi chuyển qua lại giữa các màn hình
      // Chỉ remove các listener cụ thể
      if (socketRef.current) {
        if (id) {
          socketRef.current.emit('leaveConversation', id);
          socketRef.current.off('newMessage');
        } else {
          socketRef.current.off('conversationsList');
          socketRef.current.off('newConversation');
        }
        socketRef.current.off('connect');
      }
    };
  }, [isLogin, id]);

  const sendMessage = (conversationId: string, content: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', { conversationId, content });
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

  return {
    data: id ? conversationDetail : conversations,
    isLoading: loading,
    error,
    sendMessage,
    refreshData
  };
};

export default useConversationSocket;
