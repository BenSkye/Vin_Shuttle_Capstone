import Link from 'next/link'
import { Routes } from '@/constants/routers'
import { Logo } from '@/components/icons/Logo'
import { FiMenu, FiX } from 'react-icons/fi'

interface PublicHeaderProps {
    isOpen: boolean
    toggleMenu: () => void
}

const publicNavItems = [
    { label: 'Trang Chủ', href: Routes.HOME },
    { label: 'Tính năng', href: Routes.FEATURES },
    { label: 'Về chúng tôi', href: Routes.ABOUT },
]

export function PublicHeader({ isOpen, toggleMenu }: PublicHeaderProps) {
    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <nav className="flex items-center justify-between bg-white px-4 py-4">
                <Logo size="large" />
                <div className="hidden items-center justify-center space-x-8 md:flex">
                    {publicNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-lg font-medium text-gray-600 transition hover:text-green-500"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className="relative hidden items-center space-x-4 md:flex">
                    <Link
                        href={Routes.AUTH.LOGIN}
                        className="rounded-lg border border-gray-200 px-6 py-2 text-lg font-medium text-gray-600 transition hover:border-green-500 hover:text-green-500"
                    >
                        Đăng nhập
                    </Link>
                    <Link
                        href={Routes.AUTH.SIGNUP}
                        className="rounded-lg bg-green-500 px-6 py-2 text-lg font-medium text-white transition hover:bg-green-600"
                    >
                        Đăng ký
                    </Link>
                </div>
                <button onClick={toggleMenu} className="text-2xl text-gray-600 md:hidden">
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="fixed bottom-0 left-0 right-0 top-[72px] z-50 overflow-y-auto bg-white shadow-lg md:hidden">
                    <div className="flex max-h-[calc(100vh-72px)] flex-col space-y-4 p-4 pb-20">
                        {publicNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="border-b border-gray-100 py-2 text-lg font-medium text-gray-600 transition hover:text-green-500"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="flex flex-col space-y-3 border-t border-gray-100 pt-4">
                            <Link
                                href={Routes.AUTH.LOGIN}
                                className="rounded-lg border border-gray-200 py-2 text-center text-gray-600 hover:text-green-500"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href={Routes.AUTH.SIGNUP}
                                className="rounded-lg bg-green-500 py-2 text-center text-white hover:bg-green-600"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}