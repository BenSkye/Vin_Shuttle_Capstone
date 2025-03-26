import Link from 'next/link'
import { Routes } from '@/constants/routers'
import { Logo } from '@/components/icons/Logo'
import { FiMenu, FiX } from 'react-icons/fi'

interface PublicHeaderProps {
    isOpen: boolean
    toggleMenu: () => void
}

export function PublicHeader({ isOpen, toggleMenu }: PublicHeaderProps) {
    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <nav className="flex items-center justify-between bg-white px-4 py-4">
                {/* Logo */}
                <Logo size="large" />

                {/* Desktop Auth Buttons */}
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

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="text-2xl text-gray-600 md:hidden"
                    aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
                >
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="fixed bottom-0 left-0 right-0 top-[72px] z-50 overflow-y-auto bg-white shadow-lg md:hidden">
                    <div className="flex flex-col space-y-3 p-4">
                        <Link
                            href={Routes.AUTH.LOGIN}
                            className="rounded-lg border border-gray-200 py-3 text-center text-lg font-medium text-gray-600 transition hover:border-green-500 hover:text-green-500"
                            onClick={toggleMenu}
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href={Routes.AUTH.SIGNUP}
                            className="rounded-lg bg-green-500 py-3 text-center text-lg font-medium text-white transition hover:bg-green-600"
                            onClick={toggleMenu}
                        >
                            Đăng ký
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}