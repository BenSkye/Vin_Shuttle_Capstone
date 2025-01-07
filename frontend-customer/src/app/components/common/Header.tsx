'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button, Layout, Menu } from 'antd'
import {
    MenuUnfoldOutlined,
    CloseOutlined,
    HomeOutlined,
    CarOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    LoginOutlined,
    UserAddOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Header: AntHeader } = Layout

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Handle responsive detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024) // 1024px is the 'lg' breakpoint
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false) // Close mobile menu on larger screens
            }
        }

        // Initial check
        handleResize()

        // Add event listener
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const menuItems: MenuProps['items'] = [
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: <Link href="/">Trang chủ</Link>
        },
        {
            key: 'booking',
            icon: <CarOutlined />,
            label: <Link href="/booking">Đặt xe</Link>
        },
        {
            key: 'routes',
            icon: <EnvironmentOutlined />,
            label: <Link href="/routes">Tuyến đường</Link>
        },
        {
            key: 'contact',
            icon: <PhoneOutlined />,
            label: <Link href="/contact">Liên hệ</Link>
        },
    ]

    const authButtons = (isMobile = false) => (
        <div className={`flex ${isMobile ? 'flex-col' : ''} gap-2`}>
            <Button
                type={isMobile ? "primary" : "default"}
                icon={<LoginOutlined />}
                className={
                    isMobile
                        ? "bg-blue-500 hover:bg-blue-600 w-full"
                        : "text-white border-white hover:text-blue-500 hover:bg-white"
                }
            >
                <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button
                type={isMobile ? "default" : "primary"}
                icon={<UserAddOutlined />}
                className={
                    isMobile
                        ? "w-full"
                        : "bg-white text-blue-500 hover:bg-gray-100"
                }
            >
                <Link href="/signup">Đăng ký</Link>
            </Button>
        </div>
    )

    return (
        <AntHeader
            className="bg-gradient-to-r from-blue-500 to-green-500 px-6 py-4 fixed w-full z-50 shadow-md flex items-center justify-between"
            style={{ height: 'auto' }}
        >
            {/* Left: Logo */}
            <Link href="/" className="flex items-center">
                <Image
                    src="/favicon.svg"
                    alt="VinShuttle"
                    width={40}
                    height={40}
                    className="object-contain"
                />
                <span className="ml-3 text-white text-xl font-bold">
                    VinShuttle
                </span>
            </Link>

            {/* Center: Menu (only on desktop) */}
            {!isMobile && (
                <div className="flex-1 flex justify-center">
                    <Menu
                        mode="horizontal"
                        defaultSelectedKeys={['home']}
                        items={menuItems}
                        className="!flex-nowrap bg-transparent text-white border-none"
                        style={{
                            color: 'white',
                        }}
                    />
                </div>
            )}

            {/* Right: Auth Buttons */}
            <div className="flex items-center ml-auto">
                {!isMobile && authButtons()}
                {isMobile && (
                    <Button
                        type="text"
                        icon={mobileMenuOpen ? <CloseOutlined className="text-xl text-white" /> : <MenuUnfoldOutlined className="text-xl bg-white p-2 rounded-md" />}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-white"
                    />
                )}
            </div>

            {/* Mobile Menu */}
            {isMobile && mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div
                        className="fixed right-0 top-0 h-full w-[80%] max-w-[400px] bg-white shadow-xl transition-transform duration-300 ease-in-out"
                        onClick={e => e.stopPropagation()}
                        style={{
                            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)'
                        }}
                    >
                        {/* Mobile Menu Items */}
                        <Menu
                            mode="inline"
                            defaultSelectedKeys={['home']}
                            items={menuItems}
                            className="border-none mt-4"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Close Button Inside Mobile Menu */}
                        <div className="absolute top-2 right-2">
                            <Button
                                type="text"
                                icon={<CloseOutlined className="text-2xl text-red-600" />}
                                onClick={() => setMobileMenuOpen(false)}
                            />
                        </div>

                        {/* Mobile Auth Buttons */}
                        <div className="p-4 border-t mt-4">
                            {authButtons(true)}
                        </div>
                    </div>
                </div>
            )}
        </AntHeader>
    )
}
