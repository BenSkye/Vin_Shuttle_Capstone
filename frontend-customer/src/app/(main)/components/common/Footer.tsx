'use client'

import { Layout } from 'antd'
import Link from 'next/link'

const { Footer: AntFooter } = Layout

export default function Footer() {
  return (
    <AntFooter className="bg-gray-800 p-8 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-4">
        {/* About Section */}
        <div>
          <h3 className="mb-4 text-lg font-bold">Về VinShuttle</h3>
          <p className="text-gray-300">
            Dịch vụ vận chuyển nội khu thông minh tại VinHomes Grand Park
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-4 text-lg font-bold">Liên kết nhanh</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="text-gray-300 hover:text-white">
                Về chúng tôi
              </Link>
            </li>
            <li>
              <Link href="/services" className="text-gray-300 hover:text-white">
                Dịch vụ
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-gray-300 hover:text-white">
                Bảng giá
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-300 hover:text-white">
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="mb-4 text-lg font-bold">Thông tin liên hệ</h3>
          <ul className="space-y-2 text-gray-300">
            <li>Số điện thoại: 1900 xxxx</li>
            <li>Email: support@vinshuttle.com</li>
            <li>Địa chỉ: VinHomes Grand Park, Quận 9, TP.HCM</li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="mb-4 text-lg font-bold">Kết nối với chúng tôi</h3>
          <div className="flex space-x-4">{/* Add your social media icons/links here */}</div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-300">
        <p>&copy; {new Date().getFullYear()} VinShuttle. All rights reserved.</p>
      </div>
    </AntFooter>
  )
}
