'use client'

import { useEffect, useState } from 'react'
import { Spin, notification, Tabs } from 'antd'

import { TripStatus, TripStatusInfo } from '@/constants/trip.enum'
import { useTripQuery } from '@/hooks/queries/trip.query'
import useTripSocket from '@/hooks/sockets/useTripSocket'
import { Trip } from '@/interface/trip.interface'
import NoTrips from '@/views/Trips/components/NoTrips'
import TripCard from '@/views/Trips/components/TripCard'

const TripListPage = () => {
  const { data: trips, isLoading, error } = useTripQuery()
  const [activeTab, setActiveTab] = useState('active')

  useTripSocket()

  useEffect(() => {
    if (error) {
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Lỗi khi tải danh sách cuốc xe',
      })
    }
  }, [error])

  const getStatusInfo = (status: string): TripStatusInfo => {
    switch (status) {
      case TripStatus.BOOKING:
        return { text: 'Đang đặt', className: 'bg-yellow-100 text-yellow-800' }
      case TripStatus.CONFIRMED:
        return { text: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' }
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

  const getFilteredTrips = () => {
    if (!trips) return []

    const tripList = trips as Trip[]

    if (activeTab === 'active') {
      return tripList
        .filter(trip =>
          trip.status === TripStatus.BOOKING ||
          trip.status === TripStatus.CONFIRMED ||
          trip.status === TripStatus.PICKUP ||
          trip.status === TripStatus.IN_PROGRESS
        )
        .sort((a, b) => {
          const statusOrder = {
            [TripStatus.IN_PROGRESS]: 4,
            [TripStatus.PICKUP]: 3,
            [TripStatus.CONFIRMED]: 2,
            [TripStatus.BOOKING]: 1
          }

          if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[b.status] - statusOrder[a.status]
          }

          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        })
    } else {
      return tripList
        .filter(trip =>
          trip.status === TripStatus.COMPLETED ||
          trip.status === TripStatus.CANCELLED ||
          trip.status === TripStatus.DROPPED_OFF
        )
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }
  }

  const filteredTrips = getFilteredTrips()

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spin size="large" tip="Đang tải danh sách cuốc xe..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">
        Lịch sử cuốc xe
        <div className="mt-2 h-1 w-20 bg-blue-500" />
      </h1>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'active',
            label: 'Hoạt động',
            children: filteredTrips.length === 0 ? (
              <NoTrips isActiveTab />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTrips.map((trip, index) => (
                  <TripCard
                    key={trip._id}
                    trip={trip}
                    index={index}
                    getStatusInfo={getStatusInfo}
                  />
                ))}
              </div>
            )
          },
          {
            key: 'history',
            label: 'Lịch sử',
            children: filteredTrips.length === 0 ? (
              <NoTrips isActiveTab={false} />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTrips.map((trip, index) => (
                  <TripCard
                    key={trip._id}
                    trip={trip}
                    index={index}
                    getStatusInfo={getStatusInfo}
                  />
                ))}
              </div>
            )
          }
        ]}
      />
    </div>
  )
}

export default TripListPage