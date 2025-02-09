'use client'

import { Layout } from 'antd'

const Header = () => {
    return <div>Header</div>
}

const Footer = () => {
    return <div>Footer</div>
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return <Layout>
        <Header />
        <Layout.Content>
            {children}
        </Layout.Content>
        <Footer />
    </Layout>
}

export default AuthLayout;
