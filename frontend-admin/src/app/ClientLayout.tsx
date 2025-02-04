'use client';
import { Geist } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import 'antd/dist/reset.css';
import '@ant-design/v5-patch-for-react-19';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useState } from 'react';

const geist = Geist({
  subsets: ["latin"],
});

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('accessToken');
    if (!token && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  // Không render nội dung cho đến khi component được mount
  if (!mounted) {
    return null;
  }

  return (
    <html lang="en">
      <body className={geist.className}>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
