'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'

import { bookingStatusColor } from '@/constants/booking.constants'

import { IBooking } from '@/interface/booking.interface'
import { getCustomerPersonalBookingById } from '@/service/booking.service'
import { formatVndPrice } from '@/utils/price.until'

export default function BookingDetailPage({ id }: { id: string }) {
  const [booking, setBooking] = useState<IBooking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchBookingDetail(id)
  }, [id])

  const fetchBookingDetail = async (bookingId: string) => {
    try {
      const response = await getCustomerPersonalBookingById(bookingId)
      setBooking(response)
    } catch (error) {
      console.error('Error fetching booking detail:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6 h-8 w-3/4 rounded bg-gray-200"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded bg-gray-200"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700">Không tìm thấy thông tin đặt xe</h3>
          <p className="mt-2 text-gray-500">Vui lòng kiểm tra lại mã đơn hàng</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4">
      {/* Header */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          Chi Tiết Đơn Đặt Xe #{booking.bookingCode}
        </h1>
      </div>

      {/* Booking Info Card */}
      <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Mã Đơn</p>
            <p className="text-lg font-semibold">{booking.bookingCode}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Trạng Thái</p>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                bookingStatusColor[booking.status] === 'green'
                  ? 'bg-green-100 text-green-800'
                  : bookingStatusColor[booking.status] === 'red'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {booking.status.replace('_', ' ')}
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Số Chuyến</p>
            <p className="text-lg font-semibold">{booking.trips.length}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Tổng Tiền</p>
            <p className="text-lg font-semibold text-green-600">
              {formatVndPrice(booking.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Lịch Sử Trạng Thái</h2>
        <div className="space-y-6">
          {booking.statusHistory.map((history, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`h-4 w-4 rounded-full ${
                    bookingStatusColor[history.status] === 'green'
                      ? 'bg-green-500'
                      : bookingStatusColor[history.status] === 'red'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`}
                ></div>
                {index !== booking.statusHistory.length - 1 && (
                  <div className="mt-2 h-full w-0.5 bg-gray-200"></div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {new Date(history.changedAt).toLocaleString()}
                </p>
                <p className="mt-1 font-medium">{history.status.replace('_', ' ')}</p>
                {history.reason && <p className="mt-1 text-sm text-gray-600">{history.reason}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trips List */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Danh Sách Chuyến</h2>
        <div className="space-y-4">
          {booking.trips.map((tripId, index) => (
            <div
              key={tripId}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <span className="text-gray-700">Chuyến {index + 1}</span>
              <Link
                href={`/trips/${tripId}`}
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
