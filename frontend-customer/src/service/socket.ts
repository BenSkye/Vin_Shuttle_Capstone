import Cookies from 'js-cookie'
import { io } from 'socket.io-client'

export const initSocket = (namespace: string) => {
  const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:2028'
  const token = Cookies.get('authorization')
  const clientId = Cookies.get('userId')

  if (!token || !clientId) {
    console.error('Missing authentication credentials')
    return io(`${SOCKET_URL}/${namespace}`, {
      autoConnect: false,
    })
  }

  return io(`${SOCKET_URL}/${namespace}`, {
    auth: {
      authorization: `Bearer ${token}`,
      'x-client-id': clientId,
    },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    transports: ['websocket'],
  })
}
