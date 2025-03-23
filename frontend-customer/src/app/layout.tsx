import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AntdRegistry } from '@/lib/AntdRegistry'
import BaseLayout from '@/components/layout/Baselayout'
import { Providers } from '@/providers'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VinShuttle - Dịch vụ vận chuyển nội khu thông minh',
  description: 'Dịch vụ vận chuyển nội khu thông minh tại VinHomes Grand Park',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <AntdRegistry>
          <Providers>
            <BaseLayout>{children}</BaseLayout>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  )
}