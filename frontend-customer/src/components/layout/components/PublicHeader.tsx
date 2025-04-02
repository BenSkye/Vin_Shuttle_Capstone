import Link from 'next/link'
import { Routes } from '@/constants/routers'
import { Logo } from '@/components/icons/Logo'
import { FiMenu, FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface PublicHeaderProps {
    isOpen: boolean
    toggleMenu: () => void
}

export function PublicHeader({ isOpen, toggleMenu }: PublicHeaderProps) {
    return (
        <header className="sticky top-0 z-50 border-b border-divider bg-surface shadow-sm backdrop-blur-sm">
            <nav className="flex items-center justify-between bg-surface/80 px-4 py-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Logo size="large" />
                </motion.div>

                {/* Desktop Auth Buttons */}
                <div className="relative hidden items-center space-x-4 md:flex">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Link
                            href={Routes.AUTH.LOGIN}
                            className="rounded-lg border border-divider px-6 py-2 text-lg font-medium text-content-secondary transition-all hover:border-primary-500 hover:text-primary-500"
                        >
                            Đăng nhập
                        </Link>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <Link
                            href={Routes.AUTH.SIGNUP}
                            className="rounded-lg bg-primary-500 px-6 py-2 text-lg font-medium text-content-inverse transition-all hover:bg-primary-600"
                        >
                            Đăng ký
                        </Link>
                    </motion.div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="text-2xl text-content-secondary transition-colors hover:text-primary-500 md:hidden"
                    aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
                >
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-0 left-0 right-0 top-[72px] z-50 overflow-y-auto bg-surface shadow-lg md:hidden"
                    >
                        <div className="flex flex-col space-y-3 p-4">
                            <Link
                                href={Routes.AUTH.LOGIN}
                                className="rounded-lg border border-divider py-3 text-center text-lg font-medium text-content-secondary transition-all hover:border-primary-500 hover:text-primary-500"
                                onClick={toggleMenu}
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href={Routes.AUTH.SIGNUP}
                                className="rounded-lg bg-primary-500 py-3 text-center text-lg font-medium text-content-inverse transition-all hover:bg-primary-600"
                                onClick={toggleMenu}
                            >
                                Đăng ký
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}