'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Routes } from '@/constants/routers'

import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'

import { PrivateHeader } from '../components/PrivateHeader'
import { PublicHeader } from '../components/PublicHeader'

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
      // <PublicHeader isOpen={isOpen} toggleMenu={toggleMenu} />
      <div></div>
    )
  }

  return <PrivateHeader






  />
}
