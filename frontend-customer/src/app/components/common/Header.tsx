"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { FiMenu, FiX } from "react-icons/fi"

export default function Navbar() {
    const [language, setLanguage] = useState<"VI" | "EN">("VI")
    const [isOpen, setIsOpen] = useState(false)

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === "VI" ? "EN" : "VI"))
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const navItems = [
        { label: "Trang Chủ", href: "/" },
        { label: "Đặt xe", href: "/booking" },
        { label: "Hướng dẫn", href: "/guide" },
        { label: "Liên Hệ", href: "/contact" },
        { label: "Tính năng", href: "/features" },
        { label: "Blog", href: "/blog" },
        { label: "Fanpage", href: "/page" },
    ]

    return (
        <nav className="flex items-center justify-between px-4 py-4 bg-white shadow-sm">
            {/* Logo */}
            <Link href="/" className="flex items-center">
                <Image src="/favicon.svg" alt="VinShuttle" width={40} height={40} className="object-contain" />
                <span className="ml-3 text-black text-2xl font-bold">VinShuttle</span>
            </Link>

            {/* Desktop Navigation - Dịch sang trái xa hơn */}
            <div className="hidden md:flex justify-center items-center space-x-12 ml-24 mr-auto pl-72">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="text-gray-600 hover:text-green-500 transition-colors text-lg font-medium"
                    >
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* Language Button */}
            <button
                onClick={toggleLanguage}
                className="hidden md:block text-gray-600 hover:text-green-500 transition-colors text-lg font-medium"
            >
                {language === "VI" ? "VI | EN" : "EN | VI"}
            </button>

            {/* Mobile Menu Button */}
            <button onClick={toggleMenu} className="md:hidden text-gray-600 text-2xl">
                {isOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="fixed top-0 left-0 w-full h-[60%] bg-white shadow-md flex flex-col items-center py-6 space-y-4 z-50 rounded-b-lg transition-all duration-300">
                    {/* Nút đóng menu */}
                    <button onClick={toggleMenu} className="absolute top-4 right-6 text-2xl text-gray-600">
                        <FiX />
                    </button>

                    {/* Danh sách menu */}
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-gray-600 hover:text-green-500 transition-colors text-lg font-medium"
                            onClick={() => setIsOpen(false)} // Đóng menu khi chọn
                        >
                            {item.label}
                        </Link>
                    ))}

                    {/* Nút chuyển ngôn ngữ */}
                    <button
                        onClick={toggleLanguage}
                        className="text-gray-600 hover:text-green-500 transition-colors text-lg font-medium"
                    >
                        {language === "VI" ? "VI | EN" : "EN | VI"}
                    </button>
                </div>
            )}
        </nav>
    )
}
