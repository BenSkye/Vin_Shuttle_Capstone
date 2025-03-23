'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'
import Header from './base/Header'
import Footer from './base/Footer'
import { Content } from 'antd/es/layout/layout'

interface BaseLayoutProps {
    children: React.ReactNode
}

export default function BaseLayout({ children }: BaseLayoutProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        NProgress.configure({
            showSpinner: false,
            minimum: 0.3,
            easing: 'ease',
            speed: 800,
        })
    }, [])

    useEffect(() => {
        NProgress.done()
        return () => {
            NProgress.start()
        }
    }, [pathname, searchParams])

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <Content className="flex-1 bg-gray-50" style={{ backgroundColor: '#f5f5f5', width: '100%' }}>
                {children}
            </Content>

            <Footer />
        </div>
    )
}