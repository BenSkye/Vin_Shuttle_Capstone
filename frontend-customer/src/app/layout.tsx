import { polyfill } from 'interweave-ssr'
import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { ConfigProvider } from 'antd'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import NextTopLoader from 'nextjs-toploader'
import { Suspense } from 'react'
import Loading from '@/components/shared/Loading'

polyfill()

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VinShuttle',
  description: 'VinHome Grand Park Internal Transportation Service',
  icons: {
    icon: '/images/bus.gif',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
              {children}
            </Suspense>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}