'use client'

import { useEffect } from 'react';

export default function PaymentCallback() {
    useEffect(() => {
        // Gửi thông điệp tới trang chủ nếu đang trong iframe
        if (window.self !== window.top) {
            window.parent.postMessage('PAYMENT_SUCCESS', window.location.origin);
        } else {
            const returnUrl = '/trips';
            setTimeout(() => window.location.href = returnUrl, 200);
        }
    }, []);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Đang xử lý thanh toán...</h1>
                <p>Vui lòng đợi trong giây lát.</p>
            </div>
        </div>
    );
}