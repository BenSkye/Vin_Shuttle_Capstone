import PrivateLayout from '@/components/layout/PrivateLayout'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return <PrivateLayout>{children}</PrivateLayout>
}
