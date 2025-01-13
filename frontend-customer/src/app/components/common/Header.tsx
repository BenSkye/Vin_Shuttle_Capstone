'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button' // Import Button Component

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

    const menuItems = [
        {
            key: 'home',
            icon: '🏠',
            label: <Link href="/">Trang chủ</Link>
        },
        {
            key: 'booking',
            icon: '🚗',
            label: <Link href="/booking">Đặt xe</Link>
        },
        {
            key: 'routes',
            icon: '🛣️',
            label: <Link href="/routes">Tuyến đường</Link>
        },
        {
            key: 'contact',
            icon: '📞',
            label: <Link href="/contact">Liên hệ</Link>
        },
    ]

    const authButtons = (isMobile: boolean) => (
        <div className={`flex ${isMobile ? 'flex-col' : ''} gap-2`}>
            <Button
                variant={isMobile ? 'blue' : 'outline'}
                fullWidth={isMobile}
                className={isMobile ? 'text-white' : 'text-blue-500'}
            >
                <Link href="/login">
                    🔑 Đăng nhập
                </Link>
            </Button>
            <Button
                variant={isMobile ? 'default' : 'blue'}
                fullWidth={isMobile}
                className={isMobile ? 'text-blue-500' : 'text-white'}
            >
                <Link href="/signup">
                    ✍️ Đăng ký
                </Link>
            </Button>
        </div>
    )

    return (
        <header className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-pink-500 px-6 py-4 fixed w-full z-50 shadow-lg rounded-b-2xl">
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
                    <nav className="flex space-x-6">
                        {menuItems.map((item) => (
                            <Link
                                key={item.key}
                                href={item.label.props.href}
                                className="text-white hover:text-blue-500"
                            >
                                <Button className="bg-white text-black hover:bg-gray-100 hover:text-blue-500">
                                    <span className="text-2xl">{item.icon}</span>
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* Right: Auth Buttons */}
            <div className="flex items-center ml-auto">
                {!isMobile && authButtons(false)}
                {isMobile && (
                    <button
                        type="button"
                        className="text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <span className="text-xl text-white">✖️</span>
                        ) : (
                            <span className="text-xl bg-white p-2 rounded-md">☰</span>
                        )}
                    </button>
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
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            transform: mobileMenuOpen
                                ? 'translateX(0)'
                                : 'translateX(100%)',
                        }}
                    >
                        {/* Mobile Menu Items */}
                        <div className="flex flex-col mt-4">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.key}
                                    href={item.label.props.href}
                                    className="p-4 text-black hover:bg-gray-100"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="text-2xl">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Close Button Inside Mobile Menu */}
                        <div className="absolute top-2 right-2">
                            <button
                                className="text-red-600 text-2xl"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                ✖️
                            </button>
                        </div>

                        {/* Mobile Auth Buttons */}
                        <div className="p-4 border-t mt-4">
                            {authButtons(true)}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
