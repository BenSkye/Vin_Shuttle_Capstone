import { Layout } from 'antd'
import Header from './components/common/Header'
import Footer from './components/common/Footer'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Layout className="min-h-screen">
            <Header />
            <main className="">
                <div className="">
                    {children}
                </div>
            </main>
            <Footer />
        </Layout>
    )
} 