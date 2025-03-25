'use client'

import { Routes } from '@/constants/routers'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Spin } from 'antd'

interface PrivateLayoutProps {
    children: React.ReactNode
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
    const { isLoggedIn, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.replace(Routes.AUTH.LOGIN)
        }
    }, [isLoggedIn, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spin
                    size="large"
                    tip="Đang kiểm tra đăng nhập..."
                    className="text-gray-600"
                />
            </div>
        )
    }

    if (!isLoggedIn) {
        return null
    }

    return <>{children}</>
}