import { AuthProvider } from '@/contexts/AuthContext'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <AuthProvider>
                {children}
            </AuthProvider>
        </div>
    )
}