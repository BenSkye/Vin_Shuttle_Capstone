import { useCallback, useEffect, useState } from 'react'

import { SOCKET_NAMESPACE } from '@/constants/socket.enum'

import { useAuth } from '@/context/AuthContext'
import { INotification } from '@/interface/notification'
import { getPersonalNotification } from '@/service/notification.service'
import { initSocket } from '@/service/socket'

const useNotificationSocket = () => {
  const [notifications, setNotifications] = useState<INotification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const { isLoggedIn, logout } = useAuth()

  const fetchInitialData = useCallback(async () => {
    setLoading(true)
    try {
      const notificationData = await getPersonalNotification()
      const sortedNotifications = notificationData.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setNotifications(sortedNotifications)
      const unreadNotifications = sortedNotifications.filter((notification) => !notification.isRead)
      setUnreadCount(unreadNotifications.length)
      setError(null)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err as Error)
      if ((err as any).response?.status === 401) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    const socket = initSocket(SOCKET_NAMESPACE.NOTIFICATIONS)

    const handleConnect = () => {
      console.log('Notification socket connected:', socket.id)
      reconnectAttempts = 0
      fetchInitialData()
    }

    const handleConnectError = (err: Error) => {
      console.error('Notification connection error:', err.message)
      if (err.message.includes('Invalid token')) {
        logout()
        return
      }

      reconnectAttempts++
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        socket.disconnect()
      }
    }

    const handleNewNotification = (newNotification: INotification) => {
      setNotifications((prevNotifications) => {
        const updatedNotifications = [newNotification, ...prevNotifications]
        return updatedNotifications.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      })
      setUnreadCount((prevCount) => prevCount + 1)
    }

    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count)
    }

    socket.on('connect', handleConnect)
    socket.on('connect_error', handleConnectError)
    socket.on('new_notification', handleNewNotification)
    socket.on('unread_notification_count', handleUnreadCount)

    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('connect_error', handleConnectError)
      socket.off('new_notification', handleNewNotification)
      socket.off('unread_notification_count', handleUnreadCount)
      socket.disconnect()
    }
  }, [isLoggedIn, fetchInitialData, logout])

  return {
    notifications,
    unreadCount,
    isLoading: loading,
    error,
    refetch: fetchInitialData,
  }
}

export default useNotificationSocket
