import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import 'antd/dist/reset.css';

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Vin Shuttle Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
