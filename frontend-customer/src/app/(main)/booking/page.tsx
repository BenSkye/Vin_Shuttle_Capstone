'use client'

import { useEffect, useState } from 'react'

import { Alert, Typography, message } from 'antd'
import Link from 'next/link'

import { bookingStatusColor } from '@/constants/booking.constants'

import { IBooking } from '@/interface/booking'
import { getCustomerPersonalBooking } from '@/service/booking.service'
import { formatVndPrice } from '@/utils/price.until'

const { Title } = Typography

const BookingList = () => {
  const [bookings, setBookings] = useState<IBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setError(null)
        const data = await getCustomerPersonalBooking()
        setBookings(data)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Không thể tải danh sách đơn đặt xe'

        console.error('Error fetching bookings:', error)
        setError(errorMessage)
        message.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-8 text-center">
        Lịch Sử Thanh Toán
      </Title>

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          className="mb-6"
          closable
          onClose={() => setError(null)}
        />
      )}

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Mã đơn: {booking.bookingCode}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${bookingStatusColor[booking.status] || 'bg-blue-100 text-blue-800'}`}
                  >
                    {booking.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 4h-4M14 4H5a1 1 0 00-1 1v4a1 1 0 001 1h9M19 4v16H5a1 1 0 01-1-1V9"
                      />
                    </svg>
                    <span>Số chuyến: {booking.trips.length}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{formatVndPrice(booking.totalAmount)}</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <Link
                    href={`/booking/${booking._id}`}
                    className="inline-flex items-center text-blue-600 transition-colors hover:text-blue-700"
                  >
                    Xem chi tiết
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-lg text-gray-500">Bạn chưa có đơn đặt xe nào</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BookingList
