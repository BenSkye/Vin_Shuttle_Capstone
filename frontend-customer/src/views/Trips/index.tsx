'use client'

import { useEffect } from 'react'

import { Spin, notification } from 'antd'
import { motion } from 'framer-motion'
import Link from 'next/link'

import { TripStatus } from '@/constants/trip.enum'
import { useTripQuery } from '@/hooks/queries/trip.query'
import useTripSocket from '@/hooks/sockets/useTripSocket'

import { Trip } from '@/interface/trip.interface'
import { serviceTypeText } from '@/constants/service-type.enum'

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
      case TripStatus.DROPPED_OFF:
        return { text: 'Không thực hiện', className: 'bg-gray-100 text-gray-800' }
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
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Background decoration */}
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-50 transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-100" />

              <div className="relative space-y-4">
                {/* Header section */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex flex-col">
                      <span className="text-xs font-medium text-gray-500">Mã cuốc xe</span>
                      <h4 className="text-2xl font-bold text-black sm:text-3xl">
                        {trip.code}
                      </h4>
                    </div>
                    <p className="mt-1 text-sm font-medium text-blue-600">
                      {serviceTypeText[trip.serviceType]}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
                  >
                    {statusInfo.text}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Driver info */}
                {trip.driverId && (
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Tài xế</h3>
                      <p className="text-gray-900">{trip.driverId.name || 'Chưa có tài xế'}</p>
                    </div>
                  </div>
                )}

                {trip?.timeStart ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Bắt đầu: </h3>
                      <p className="text-gray-900">
                        {new Date(trip.timeStart).toLocaleString('vi-VN', {
                          timeZone: 'Asia/Ho_Chi_Minh',
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ) : trip?.timeStartEstimate ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Bắt đầu dự kiến: </h3>
                      <p className="text-gray-900">
                        {new Date(trip.timeStartEstimate).toLocaleString('vi-VN', {
                          timeZone: 'Asia/Ho_Chi_Minh',
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Thời gian bắt đầu: </h3>
                      <p className="text-gray-900">Chưa xác định</p>
                    </div>
                  </div>
                )}



                {/* Vehicle info */}
                {trip.vehicleId && (
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Thông Tin Xe</h3>
                      <p className="text-gray-900">
                        • {trip.vehicleId.name}
                      </p>
                      <p className="text-gray-900">
                        • Biển số xe: {trip.vehicleId.licensePlate}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rating badge */}
                {trip.status === TripStatus.COMPLETED && trip.isRating && (
                  <div className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                    <span>Đã đánh giá</span>
                  </div>
                )}

                {/* View details link */}
                <div className="pt-2">
                  <Link
                    href={`/trips/${trip._id}`}
                    className="inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                  >
                    Xem chi tiết
                    <svg
                      className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
              </div>
            </motion.div>
          )
        })}
      </div>
    </div >
  )
}

export default TripListPage
