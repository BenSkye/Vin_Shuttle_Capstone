'use client'

import { Content } from 'antd/es/layout/layout'
import NextTopLoader from 'nextjs-toploader'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import Header from './base/Header'
import Footer from './base/Footer'


const TIMEOUT = 1500
interface BaseLayoutProps {
    children: React.ReactNode
}

export default function BaseLayout({ children }: BaseLayoutProps) {
    const pathname = usePathname()
    const isConversationPage = pathname?.startsWith('/conversations')
    const [isRouteChanging, setIsRouteChanging] = useState(false)

    useEffect(() => {
        setIsRouteChanging(true)
        const timer = setTimeout(() => {
            setIsRouteChanging(false)
        }, TIMEOUT)

        return () => clearTimeout(timer)
    }, [pathname])

    if (isRouteChanging) {
        return <LoadingScreen />
    }

    return (
        <div className="flex min-h-screen flex-col bg-surface">
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

            <Content className="flex-1 overflow-hidden bg-surface">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full w-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </Content>

            {!isConversationPage && <Footer />}
        </div>
    )
}