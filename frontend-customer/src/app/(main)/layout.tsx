import { Layout } from 'antd'

import Footer from '../../components/common/Footer'
import Header from '../../components/common/Header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout className="">
      <Header />
      <main className="min-h-[calc(100vh-64px-70px)] bg-white">
        <div className="container mx-auto px-4">{children}</div>
      </main>
      <Footer />
    </Layout>
  )
}
