'use client';
import { ConfigProvider, Spin } from "antd";
import 'antd/dist/reset.css';
import '@ant-design/v5-patch-for-react-19';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (!token && pathname !== '/login' && pathname !== '/forgot-password') {
        router.push('/login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider>
      {children}
    </ConfigProvider>
  );
}
