import { Inter } from 'next/font/google'
import { ConfigProvider } from 'antd'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { AuthProvider } from '../contexts/AuthContext'
import NextTopLoader from 'nextjs-toploader'

import '../styles/antd-var.css'
import '../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'VinShuttle',
  description: 'VinHome Grand Park Internal Transportation Service',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextTopLoader
          color="#00A9FF"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #00A9FF,0 0 5px #00A9FF"
        />
        <AntdRegistry>
          <ConfigProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}