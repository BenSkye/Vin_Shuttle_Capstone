import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import {
  FiChevronDown,
  FiMenu,
  FiX,
} from 'react-icons/fi'

import { Routes } from '@/constants/routers'

import { Logo } from '@/components/icons/Logo'

interface PrivateHeaderProps { }

const privateNavItems = [
  { label: 'Trang Chủ', href: Routes.HOME },
  {
    label: 'Đặt xe',
    items: [
      { label: 'Đặt xe theo giờ', href: Routes.RIDE.HOURLY },
      { label: 'Đặt xe lộ trình tham quan', href: Routes.RIDE.ROUTES },
      { label: 'Đặt xe đi chung', href: Routes.RIDE.SHARED },
      { label: 'Đặt xe điểm đến', href: Routes.RIDE.DESTINATION },
    ],
  },
  { label: 'Xe bus', href: Routes.RIDE.BUS },
  { label: 'Giới thiệu', href: Routes.ABOUT },
]

export function PrivateHeader({ }: PrivateHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  // Add padding to body to account for fixed header
  useEffect(() => {
    document.body.style.paddingTop = '72px'
    return () => {
      document.body.style.paddingTop = '0'
    }
  }, [])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const toggleMenu = () => setIsOpen(!isOpen)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    )
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[9999] border-b border-divider bg-white/95 shadow-sm">
        <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 lg:px-8">
          {/* Left Section - Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-[240px] py-2"
          >
            <Logo size="large" />
          </motion.div>

          {/* Center Section - Navigation */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex items-center space-x-2">
              {privateNavItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
                >
                  {item.items ? (
                    <div className="group relative">
                      <button className="flex items-center rounded-lg px-4 py-2 text-base font-medium text-content-secondary transition-all hover:bg-surface-secondary hover:text-primary-500">
                        {item.label}
                        <FiChevronDown className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                      </button>
                      <div className="absolute -bottom-2 left-0 right-0 h-4 bg-transparent" />
                      <div className="invisible absolute left-0 top-[calc(100%-8px)] z-[9990] min-w-[240px] rounded-lg border border-divider bg-surface py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="flex w-full items-center px-4 py-2.5 text-content-secondary transition-colors hover:bg-surface-secondary hover:text-primary-500"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="rounded-lg px-4 py-2 text-base font-medium text-content-secondary transition-all hover:bg-surface-secondary hover:text-primary-500"
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="relative hidden w-[280px] items-center justify-end space-x-2 md:flex">
            {/* No authentication required - simplified header */}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="rounded-lg p-2 text-2xl text-content-secondary transition-colors hover:bg-surface-secondary hover:text-primary-500 md:hidden"
            aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] backdrop-blur-sm md:hidden"
            onClick={toggleMenu}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-[72px] z-[9998] h-[calc(100vh-72px)] w-[75%] overflow-y-auto bg-surface shadow-xl md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col p-4 pb-20">
                {/* Navigation Links */}
                <div className="space-y-2">
                  {privateNavItems.map((item) => (
                    <div key={item.label}>
                      {item.items ? (
                        <div className="border-b border-divider">
                          <button
                            onClick={() => toggleSection(item.label)}
                            className="flex w-full items-center justify-between py-3 text-lg font-medium text-content-secondary"
                          >
                            <span>{item.label}</span>
                            <FiChevronDown
                              className={`h-5 w-5 transition-transform ${expandedSections.includes(item.label) ? 'rotate-180' : ''
                                }`}
                            />
                          </button>
                          <AnimatePresence>
                            {expandedSections.includes(item.label) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-4 space-y-2 pb-3">
                                  {item.items.map((subItem) => (
                                    <Link
                                      key={subItem.href}
                                      href={subItem.href}
                                      className="block py-2 text-content-secondary hover:text-primary-500"
                                      onClick={() => setIsOpen(false)}
                                    >
                                      {subItem.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className="block border-b border-divider py-3 text-lg font-medium text-content-secondary"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
