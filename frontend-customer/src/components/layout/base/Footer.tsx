'use client'

import { Routes } from '@/constants/routers'
import Link from 'next/link'
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiYoutube, FiTwitter } from 'react-icons/fi'

export default function Footer() {
  const quickLinks = [
    { label: 'Về chúng tôi', href: Routes.ABOUT },
    { label: 'Dịch vụ', href: Routes.FEATURES },
    { label: 'Bảng giá', href: Routes.PRICING },
    { label: 'Liên hệ', href: Routes.CONTACT },
    { label: 'Điều khoản sử dụng', href: Routes.STATIC_CONTENT.TERMS },
    { label: 'Chính sách bảo mật', href: Routes.STATIC_CONTENT.PRIVACY },
  ]

  const contactInfo = [
    { icon: <FiPhone className="text-green-400" />, text: '1900 xxxx' },
    { icon: <FiMail className="text-green-400" />, text: 'support@vinshuttle.com' },
    {
      icon: <FiMapPin className="text-green-400" />,
      text: 'VinHomes Grand Park, Quận 9, TP.HCM',
    },
  ]

  const socialLinks = [
    { icon: <FiFacebook size={24} />, href: '#', label: 'Facebook' },
    { icon: <FiInstagram size={24} />, href: '#', label: 'Instagram' },
    { icon: <FiYoutube size={24} />, href: '#', label: 'Youtube' },
    { icon: <FiTwitter size={24} />, href: '#', label: 'Twitter' },
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="mx-auto max-w-full px-12 pt-12 pb-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Về VinShuttle</h3>
            <p className="text-gray-300">
              Dịch vụ vận chuyển nội khu thông minh tại VinHomes Grand Park. Chúng tôi cam kết mang
              đến trải nghiệm di chuyển an toàn, tiện lợi và thân thiện với môi trường.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Liên kết nhanh</h3>
            <ul className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 transition-colors duration-200 hover:text-green-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Thông tin liên hệ</h3>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                    {info.icon}
                  </span>
                  <span className="text-gray-300">{info.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Đăng ký nhận tin</h3>
            <p className="text-gray-300">Nhận thông tin ưu đãi mới nhất từ chúng tôi</p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button className="rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600">
                Đăng ký
              </button>
            </div>
            <div className="pt-4">
              <h3 className="mb-3 text-lg font-bold text-white">Kết nối với chúng tôi</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-gray-300 transition-colors duration-200 hover:bg-green-500 hover:text-white"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} VinShuttle. Tất cả các quyền được bảo lưu.
            </p>
            <div className="flex space-x-6">
              <Link href={Routes.STATIC_CONTENT.TERMS} className="text-sm text-gray-400 hover:text-green-400">
                Điều khoản sử dụng
              </Link>
              <Link href={Routes.STATIC_CONTENT.PRIVACY} className="text-sm text-gray-400 hover:text-green-400">
                Chính sách bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}