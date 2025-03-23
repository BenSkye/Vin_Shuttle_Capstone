'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { PublicHeader } from '../components/PublicHeader'
import { PrivateHeader } from '../components/PrivateHeader'
import { Routes } from '@/constants/routers'

export default function Header() {
  const router = useRouter()
  const { authUser, isLoggedIn, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification()
  const [userName, setUserName] = useState<string>('Người dùng')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (authUser && authUser.name) {
      setUserName(authUser.name)
    } else if (isLoggedIn) {
      setUserName('Người dùng')
    }
  }, [authUser, isLoggedIn])

  const handleLogout = () => {
    logout()
    router.push(Routes.HOME)
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  if (isLoggedIn) {
    return (
      <PrivateHeader
        userName={userName}
        notifications={notifications}
        unreadCount={unreadCount}
        onLogout={handleLogout}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
      />
    )
  }

  return <PublicHeader isOpen={isOpen} toggleMenu={toggleMenu} />
}