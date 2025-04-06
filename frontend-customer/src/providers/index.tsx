'use client'

import { Toaster } from 'react-hot-toast'

import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { ReactQueryProvider } from '@/providers/ReactQueryProvider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <NotificationProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#22c55e',
                  secondary: '#4b5563',
                },
              },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </ReactQueryProvider>
  )
}
