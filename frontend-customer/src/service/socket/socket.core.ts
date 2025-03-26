import Cookies from 'js-cookie'
import { io, Socket } from 'socket.io-client'
import { SOCKET_NAMESPACE } from '@/constants/socket.enum'

class SocketService {
    private static instances: Map<string, Socket> = new Map()

    static getInstance(namespace: SOCKET_NAMESPACE): Socket {
        if (!this.instances.has(namespace)) {
            const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:2028'
            const token = 'Bearer ' + Cookies.get('authorization') || ''
            const clientId = Cookies.get('userId') || ''

            const socket = io(`${SOCKET_URL}/${namespace}`, {
                auth: {
                    authorization: token,
                    'x-client-id': clientId
                },
                autoConnect: false,
                reconnection: true,
                reconnectionAttempts: 3,
                transports: ['websocket'],
            })

            this.instances.set(namespace, socket)
        }
        return this.instances.get(namespace)!
    }

    static disconnect(namespace: SOCKET_NAMESPACE) {
        const socket = this.instances.get(namespace)
        if (socket) {
            socket.disconnect()
            this.instances.delete(namespace)
        }
    }
}

export default SocketService