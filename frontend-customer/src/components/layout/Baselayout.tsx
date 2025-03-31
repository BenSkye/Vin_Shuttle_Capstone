'use client'

import { Suspense } from 'react'
import { Content } from 'antd/es/layout/layout'
import { Spin } from 'antd'
import NextTopLoader from 'nextjs-toploader'
import { usePathname } from 'next/navigation'
import Header from './base/Header'
import Footer from './base/Footer'

interface BaseLayoutProps {
    children: React.ReactNode
}

export default function BaseLayout({ children }: BaseLayoutProps) {
    const pathname = usePathname()
    const isConversationPage = pathname?.startsWith('/conversations')

    return (
        <div className="flex min-h-screen flex-col overflow-hidden">
            <NextTopLoader
                color="#22c55e"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px #22c55e,0 0 5px #22c55e"
            />

            <Header />

            <Content
                className="flex-1 overflow-hidden"
                style={{ backgroundColor: '#FFFFFF', width: '100%' }}
            >
                <Suspense
                    fallback={
                        <div className="flex h-full w-full items-center justify-center">
                            <Spin size="large" />
                        </div>
                    }
                >
                    {children}
                </Suspense>
            </Content>

            {!isConversationPage && <Footer />}
        </div>
    )
}