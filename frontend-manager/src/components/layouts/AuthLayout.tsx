'use client';
import { Layout } from 'antd';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Layout>
            <Layout.Content>
                {children}
            </Layout.Content>
        </Layout>
    );
};

export default AuthLayout;