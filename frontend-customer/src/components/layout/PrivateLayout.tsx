'use client'

import { useEffect } from 'react'

import { Spin } from 'antd'
import { useRouter } from 'next/navigation'

import { Routes } from '@/constants/routers'

import { useAuth } from '@/context/AuthContext'

interface PrivateLayoutProps {
  children: React.ReactNode
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  const { isLoggedIn, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('PrivateLayout: isLoggedIn', isLoggedIn)
    console.log('PrivateLayout: isLoading', isLoading)
    if (!isLoading && !isLoggedIn) {
      router.replace(Routes.AUTH.LOGIN)
    }
  }, [isLoggedIn, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" tip="Đang kiểm tra đăng nhập..." className="text-gray-600" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  return <>{children}</>
}
