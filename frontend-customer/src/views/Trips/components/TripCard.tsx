'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

import { serviceTypeText } from '@/constants/service-type.enum'
import { TripStatusInfo } from '@/constants/trip.enum'

import { Trip } from '@/interface/trip.interface'

interface TripCardProps {
  trip: Trip
  index: number
  getStatusInfo: (status: string) => TripStatusInfo
}

const TripCard = ({ trip, index, getStatusInfo }: TripCardProps) => {
  const statusInfo = getStatusInfo(trip.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-50 transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-100" />

      <div className="relative space-y-4">
        <TripCardHeader trip={trip} statusInfo={statusInfo} />

        <div className="border-t border-gray-100"></div>

        {trip.driverId && <TripDriverInfo driver={trip.driverId} />}

        <TripTimeInfo timeStart={trip.timeStart} timeStartEstimate={trip.timeStartEstimate} />

        {trip.vehicleId && <TripVehicleInfo vehicle={trip.vehicleId} />}

        {trip.status === 'completed' && trip.isRating && <TripRatingBadge />}

        <TripDetailsLink tripId={trip._id} />
      </div>
    </motion.div>
  )
}

export default TripCard

// Sub-components

const TripCardHeader = ({ trip, statusInfo }: { trip: Trip; statusInfo: TripStatusInfo }) => (
  <div className="flex items-start justify-between">
    <div>
      <div className="inline-flex flex-col">
        <span className="text-xs font-medium text-gray-500">Mã cuốc xe</span>
        <h4 className="text-2xl font-bold text-black sm:text-3xl">{trip.code}</h4>
      </div>
      <p className="mt-1 text-sm font-medium text-blue-600">{serviceTypeText[trip.serviceType]}</p>
    </div>
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
    >
      {statusInfo.text}
    </span>
  </div>
)

const TripDriverInfo = ({ driver }: { driver: Trip['driverId'] }) => (
  <div className="flex items-center space-x-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <p className="text-gray-900">{driver?.name || 'Chưa có tài xế'}</p>
    </div>
  </div>
)

const TripTimeInfo = ({
  timeStart,
  timeStartEstimate,
}: {
  timeStart?: Date
  timeStartEstimate?: Date
}) => {
  const TimeIcon = () => (
    <svg
      className="h-6 w-6 text-blue-600 dark:text-white"
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
  )

  return (
    <div className="flex items-center space-x-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
        <TimeIcon />
      </div>
      <div>
        {timeStart ? (
          <>
            <h3 className="font-medium text-gray-700">Bắt đầu: </h3>
            <p className="text-gray-900">
              {new Date(timeStart).toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
          </>
        ) : timeStartEstimate ? (
          <>
            <h3 className="font-medium text-gray-700">Bắt đầu dự kiến: </h3>
            <p className="text-gray-900">
              {new Date(timeStartEstimate).toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
          </>
        ) : (
          <>
            <h3 className="font-medium text-gray-700">Thời gian bắt đầu: </h3>
            <p className="text-gray-900">Chưa xác định</p>
          </>
        )}
      </div>
    </div>
  )
}

const TripVehicleInfo = ({ vehicle }: { vehicle: Trip['vehicleId'] }) => (
  <div className="flex items-center space-x-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z" />
      </svg>
    </div>
    <div>
      <h3 className="font-medium text-gray-700">Thông Tin Xe</h3>
      <p className="text-gray-900">• {vehicle?.name}</p>
      <p className="text-gray-900">• Biển số xe: {vehicle?.licensePlate}</p>
    </div>
  </div>
)

const TripRatingBadge = () => (
  <div className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <span>Đã đánh giá</span>
  </div>
)

const TripDetailsLink = ({ tripId }: { tripId: string }) => (
  <div className="pt-2">
    <Link
      href={`/trips/${tripId}`}
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
)
