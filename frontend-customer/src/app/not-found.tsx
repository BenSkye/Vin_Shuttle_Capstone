'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-6 py-8 text-center">
        <div className="mb-8">
          <h1 className="text-primary mb-4 text-6xl font-bold">404</h1>
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">Không tìm thấy trang</h2>
          <p className="mb-6 text-gray-600">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
        </div>

        <Link
          href="/"
          className="text-primary bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors"
          tabIndex={0}
          aria-label="Trở về trang chủ"
        >
          <ArrowLeft className="h-4 w-4" />
          Trở về trang chủ
        </Link>
      </div>
    </div>
  )
}
