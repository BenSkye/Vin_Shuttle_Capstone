import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const initSocket = async (namespace: string) => {
    const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:2028';
    const accessToken = await AsyncStorage.getItem('accessToken');
    const userId = await AsyncStorage.getItem('userId');
    const token = `Bearer ${accessToken}`;
    console.log('accessToken', accessToken);
    if (!accessToken) {
        return null;
    }
    return io(`${SOCKET_URL}/${namespace}`, {
        auth: {
            authorization: token,
            'x-client-id': userId
        },
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 3,
        transports: ['websocket']
    });
};
//yessir
