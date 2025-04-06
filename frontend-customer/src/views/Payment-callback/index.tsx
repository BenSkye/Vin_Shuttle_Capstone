'use client'

import { useEffect } from 'react'

export default function PaymentCallback() {
  useEffect(() => {
    // Gửi thông điệp tới trang chủ nếu đang trong iframe
    if (window.self !== window.top) {
      window.parent.postMessage('PAYMENT_SUCCESS', window.location.origin)
    } else {
      const returnUrl = '/trips'
      setTimeout(() => (window.location.href = returnUrl), 200)
    }
  }, [])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Đang xử lý thanh toán...</h1>
        <p>Vui lòng đợi trong giây lát.</p>
      </div>
    </div>
  )
}
