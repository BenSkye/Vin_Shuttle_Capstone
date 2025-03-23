import { Suspense } from 'react'

import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import { polyfill } from 'interweave-ssr'
import { Inter } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'

import Loading from '@/components/shared/Loading'

import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'

import '../styles/globals.css'

polyfill()

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VinShuttle',
  description: 'VinHome Grand Park Internal Transportation Service',
  icons: {
    icon: '/images/bus.gif',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextTopLoader />
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
              },
            }}
          >
            <Suspense fallback={<Loading />}>
              <AuthProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </AuthProvider>
            </Suspense>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
