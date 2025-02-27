import { io } from 'socket.io-client';
import Cookies from 'js-cookie';


export const initSocket = (namespace: string) => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:2028';
    const token = 'Bearer ' + Cookies.get('authorization') || '';
    return io(`${SOCKET_URL}/${namespace}`, {
        auth: {
            authorization: token
        },
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 3,
        transports: ['websocket']
    });
};
