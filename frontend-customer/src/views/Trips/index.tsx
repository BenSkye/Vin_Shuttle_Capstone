'use client'

import { useEffect } from 'react'

import { Spin, notification } from 'antd'
import { motion } from 'framer-motion'
import Link from 'next/link'

import { TripStatus } from '@/constants/trip.enum'
import { useTripQuery } from '@/hooks/queries/trip.query'
import useTripSocket from '@/hooks/sockets/useTripSocket'

import { Trip } from '@/interface/trip.interface'

const TripListPage = () => {
  const { data: trips, isLoading, error } = useTripQuery()

  useTripSocket()

  useEffect(() => {
    if (error) {
      console.log('error22', error)
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Lỗi khi tải danh sách cuốc xe',
      })
    }
  }, [error])

  // Helper function to get status display text and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case TripStatus.BOOKING:
        return { text: 'Đang đặt', className: 'bg-yellow-100 text-yellow-800' }
      case TripStatus.CONFIRMED:
        return { text: 'Đã xác  nhận', className: 'bg-blue-100 text-blue-800' }
      case TripStatus.PICKUP:
        return { text: 'Đang đón', className: 'bg-orange-100 text-orange-800' }
      case TripStatus.IN_PROGRESS:
        return { text: 'Đang trong cuốc xe', className: 'bg-indigo-100 text-indigo-800' }
      case TripStatus.COMPLETED:
        return { text: 'Đã hoàn thành', className: 'bg-green-100 text-green-800' }
      case TripStatus.CANCELLED:
        return { text: 'Đã hủy', className: 'bg-red-100 text-red-800' }
      default:
        return { text: status, className: 'bg-gray-100 text-gray-800' }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spin size="large" tip="Đang tải danh sách cuốc xe..." />
      </div>
    )
  }

  if (!trips || (trips as Trip[]).length === 0) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <svg
          className="h-20 w-20 text-gray-400"
          fill="none"
          strokeWidth="1.5"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
          />
        </svg>
        <p className="text-xl font-medium text-gray-600">Không có cuốc xe nào</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">
        Lịch sử cuốc xe
        <div className="mt-2 h-1 w-20 bg-blue-500" />
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(trips as Trip[]).map((trip, index) => {
          const statusInfo = getStatusInfo(trip.status)

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              key={trip._id}
              className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl"
            >
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-50 transition-all duration-300 group-hover:scale-150" />

              <div className="relative">
                {trip.driverId && (
                  <div className="mb-4 flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 p-2">
                      <svg
                        className="h-6 w-6 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {trip.driverId.name || 'Chưa có tài xế'}
                    </h3>
                  </div>
                )}

                {trip.vehicleId && (
                  <div className="mb-4 flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 p-2">
                      <svg
                        className="h-6 w-6 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <p className="text-lg text-gray-600">{trip.vehicleId.name}</p>
                  </div>
                )}

                <div className="mb-4">
                  <span
                    className={`inline-block rounded-full px-4 py-1 text-sm font-semibold ${statusInfo.className}`}
                  >
                    {statusInfo.text}
                  </span>
                </div>

                {trip.status === TripStatus.COMPLETED && trip.isRating && (
                  <div className="mb-4">
                    <span className="inline-block rounded-full bg-green-50 px-4 py-1 text-sm font-medium text-green-700">
                      Đã đánh giá
                    </span>
                  </div>
                )}

                <Link
                  href={`/trips/${trip._id}`}
                  className="mt-4 inline-flex items-center space-x-2 text-blue-600 transition-colors hover:text-blue-800"
                >
                  <span>Xem chi tiết</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default TripListPage
