import { Layout } from 'antd'
import Header from './components/common/Header'
import Footer from './components/common/Footer'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Layout className="">
            <Header />
            <main className="bg-white min-h-[calc(100vh-64px-70px)]"> {/* Điều chỉnh chiều cao để tránh tràn */}
                <div className="container mx-auto px-4">
                    {children}
                </div>
            </main>
            <Footer />
        </Layout>
    )
} 