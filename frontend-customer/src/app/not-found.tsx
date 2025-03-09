'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full px-6 py-8 text-center">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy trang
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
                    </p>
                </div>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-primary bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                    tabIndex={0}
                    aria-label="Trở về trang chủ"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Trở về trang chủ
                </Link>
            </div>
        </div>
    );
}