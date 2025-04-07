import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache to prevent multiple connection attempts
let socketInstances: Record<string, Socket> = {};

export const initSocket = async (namespace: string) => {
    // Return existing socket if already connected
    if (socketInstances[namespace]?.connected) {
        return socketInstances[namespace];
    }

    const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;
    
    // Wait for both token and userId to be retrieved
    const [accessToken, userId] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('userId')
    ]);
    
    const token = accessToken ? `Bearer ${accessToken}` : null;
    
    if (!token || !userId) {
        console.error('Socket initialization failed: Missing authentication data');
        return null;
    }
    
    try {
        const socket = io(`${SOCKET_URL}/${namespace}`, {
            auth: {
                authorization: token,
                'x-client-id': userId
            },
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
            transports: ['websocket']
        });
        
        // Add event listeners for connection issues
        socket.on('connect_error', (error) => {
            console.error(`Socket connection error (${namespace}):`, error.message);
        });
        
        socketInstances[namespace] = socket;
        return socket;
    } catch (error) {
        console.error(`Failed to initialize socket (${namespace}):`, error);
        return null;
    }
};

// Add function to reconnect socket with fresh tokens
export const reconnectSocket = async (namespace: string) => {
    // Close existing connection if any
    if (socketInstances[namespace]) {
        socketInstances[namespace].close();
        delete socketInstances[namespace];
    }
    
    // Return new socket instance
    return await initSocket(namespace);
};