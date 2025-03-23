import Cookies from 'js-cookie'
import { io } from 'socket.io-client'

export const initSocket = (namespace: string) => {
  const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:2028'
  const token = 'Bearer ' + Cookies.get('authorization') || ''
  const clientId = Cookies.get('userId') || ''
  return io(`${SOCKET_URL}/${namespace}`, {
    auth: {
      authorization: token,
      'x-client-id': clientId,
    },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 3,
    transports: ['websocket'],
  })
}
