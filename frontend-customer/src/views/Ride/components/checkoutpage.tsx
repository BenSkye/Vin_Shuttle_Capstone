'use client'

import React, { useCallback, useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import { ServiceType } from '@/constants/service-type.enum'

import { BookingResponse } from '@/interface/booking.interface'
import {
  BookingDestinationPayloadDto,
  BookingHourPayloadDto,
  BookingScenicRoutePayloadDto,
  BookingSharePayloadDto,
  Trip,
} from '@/interface/trip.interface'
import { routeService } from '@/service/mapScenic'
import { getPersonalTripById } from '@/service/trip.service'

// Dynamic import for ScenicRouteMiniMap
const ScenicRouteMiniMap = dynamic(() => import('@/views/Trips/components/ScenicRouteMiniMap'), {
  ssr: false,
})

const CheckoutPage = ({ bookingResponse }: { bookingResponse: BookingResponse }) => {
  const [booking, setBooking] = useState<BookingResponse['newBooking'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [trips, setTrips] = useState<Trip[] | null>(null)
  const [paymentUrl, setPaymentUrl] = useState('')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [routeNames, setRouteNames] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check if mobile device on component mount
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // useEffect(() => {
  //   if (shouldRedirect && typeof window !== 'undefined') window.location.href = '/trips'
  // }, [shouldRedirect])

  useEffect(() => {
    if (paymentUrl) {
      const handleMessage = (event: MessageEvent) => {
        // Kiểm tra nguồn gốc để đảm bảo bảo mật
        if (event.origin === window.location.origin) {
          if (event.data === 'PAYMENT_SUCCESS') {
            setShowPaymentDialog(false)
            const returnUrl = '/trips'
            setTimeout(() => (window.location.href = returnUrl), 200)
          }
        }
      }

      if (typeof window !== 'undefined') {
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
      }
    }
  }, [paymentUrl])

  useEffect(() => {
    setBooking(bookingResponse.newBooking)
    setPaymentUrl(bookingResponse.paymentUrl)
    setLoading(false)
  }, [bookingResponse])

  const fetchTrip = useCallback(async () => {
    const trips = []
    const routeIds: string[] = []

    if (booking) {
      for (const tripId of booking.trips) {
        try {
          const trip = await getPersonalTripById(tripId)
          trips.push(trip)

          // Collect route IDs for scenic routes
          if (trip.serviceType === ServiceType.BOOKING_SCENIC_ROUTE) {
            const routeId = (trip.servicePayload as BookingScenicRoutePayloadDto).bookingScenicRoute
              .routeId
            if (routeId) {
              routeIds.push(routeId)
            }
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError(error.message || 'Lỗi không xác định')
          } else {
            setError('Lỗi không xác định')
          }
        }
      }
    }
    setTrips(trips)

    // Fetch route names for all collected route IDs
    fetchRouteNames(routeIds)
  }, [booking])

  const fetchRouteNames = async (routeIds: string[]) => {
    const routeNamesMap: Record<string, string> = {}

    for (const routeId of routeIds) {
      try {
        const routeData = await routeService.getRouteById(routeId)
        routeNamesMap[routeId] = routeData.name
      } catch (error) {
        console.error(`Error fetching route name for ID ${routeId}:`, error)
        routeNamesMap[routeId] = 'Không tìm thấy tên tuyến'
      }
    }

    setRouteNames(routeNamesMap)
  }

  useEffect(() => {
    fetchTrip()
  }, [booking, fetchTrip])

  useEffect(() => {
    if (paymentUrl) {
      handlePayment()
    }
  }, [paymentUrl])

  const handlePayment = () => {
    setShowPaymentDialog(true)
  }

  const handleIframeLoad = () => {
    setIframeLoading(false)
  }

  const renderTripDetails = (trip: Trip) => {
    switch (trip.serviceType) {
      case ServiceType.BOOKING_HOUR:
        return (
          <div className="mb-4 rounded-lg border p-4">
            <p className="text-sm md:text-base">
              <span className="font-semibold">Thời gian:</span>{' '}
              {(trip.servicePayload as BookingHourPayloadDto).bookingHour.totalTime} phút
            </p>
            <p className="text-sm md:text-base">
              <span className="font-semibold">Điểm đón:</span>{' '}
              {(trip.servicePayload as BookingHourPayloadDto).bookingHour.startPoint.address}
            </p>
          </div>
        )
      case ServiceType.BOOKING_SCENIC_ROUTE:
        const routeId = (trip.servicePayload as BookingScenicRoutePayloadDto).bookingScenicRoute
          .routeId
        const routeName = routeNames[routeId] || 'Đang tải tên tuyến...'

        return (
          <div className="mb-4 rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">Tour tham quan</h3>
            <p className="text-sm md:text-base">
              <span className="font-semibold">Tuyến đường:</span> {routeName}
            </p>
            <p className="text-sm md:text-base">
              <span className="font-semibold">Khoảng cách:</span>{' '}
              {
                (trip.servicePayload as BookingScenicRoutePayloadDto).bookingScenicRoute
                  .distanceEstimate
              }{' '}
              km
            </p>

            {/* Add map display for the scenic route */}
            <div className="mt-3">
              <ScenicRouteMiniMap
                pickupLocation={[
                  (trip.servicePayload as BookingScenicRoutePayloadDto).bookingScenicRoute
                    .startPoint.position.lat,
                  (trip.servicePayload as BookingScenicRoutePayloadDto).bookingScenicRoute
                    .startPoint.position.lng,
                ]}
                routeId={routeId}
                height="h-48"
              />
            </div>
          </div>
        )
      case ServiceType.BOOKING_DESTINATION:
        return (
          <div className="mb-4 rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">Điểm đến cố định</h3>
            <p className="text-sm md:text-base">
              <span className="font-semibold">Điểm đón:</span>{' '}
              {
                (trip.servicePayload as BookingDestinationPayloadDto).bookingDestination.startPoint
                  .address
              }
            </p>
            <p className="text-sm md:text-base">
              <span className="font-semibold">Điểm đến:</span>{' '}
              {
                (trip.servicePayload as BookingDestinationPayloadDto).bookingDestination.endPoint
                  .address
              }
            </p>
          </div>
        )
      case ServiceType.BOOKING_SHARE:
        return (
          <div className="mb-4 rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">Đi chung xe</h3>
            <p className="text-sm md:text-base">
              <span className="font-semibold">Số chỗ:</span>{' '}
              {(trip.servicePayload as BookingSharePayloadDto).bookingShare.numberOfSeat}
            </p>
            <p className="text-sm md:text-base">
              <span className="font-semibold">Điểm đến:</span>{' '}
              {(trip.servicePayload as BookingSharePayloadDto).bookingShare.endPoint.address}
            </p>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) return <div className="py-8 text-center">Đang tải thông tin...</div>
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>
  if (!booking) return <div className="py-8 text-center">Không tìm thấy thông tin đơn hàng</div>

  return (
    <div className="flex max-w-full flex-col justify-center gap-6 p-4 lg:flex-row">
      {/* Booking Details Section */}
      <div className="w-full rounded-lg bg-white p-4 shadow-md md:p-6 lg:w-1/2 xl:w-2/5">
        <h2 className="mb-4 text-center text-xl font-semibold md:mb-6 md:text-2xl">
          Chi tiết đơn hàng #{booking.bookingCode}
        </h2>

        <div className="mb-4 rounded-lg border p-3 md:mb-6 md:p-4">
          <h4 className="mb-2 text-base font-semibold md:mb-4 md:text-lg">Thông tin thanh toán</h4>
          <div className="space-y-2">
            <p className="text-sm md:text-base">
              <span className="font-semibold">Phương thức:</span>{' '}
              {booking.paymentMethod
                ? booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)
                : 'Chưa chọn'}
            </p>
            <p className="text-sm md:text-base">
              <span className="font-semibold">Ngày tạo:</span>{' '}
              {booking.createdAt
                ? new Date(booking.createdAt).toLocaleDateString('vi-VN')
                : 'Chưa có'}
            </p>
            <p className="text-sm md:text-base">
              <span className="font-semibold">Trạng thái:</span> {'Đang chờ'}
            </p>
          </div>
        </div>

        <div className="mb-4 md:mb-6">
          <h4 className="mb-2 text-base font-semibold md:mb-4 md:text-lg">Chi tiết các cuốc xe</h4>
          <div className="space-y-3">
            {trips?.map((trip) => <div key={trip._id}>{renderTripDetails(trip)}</div>)}
          </div>
        </div>

        <div className="flex flex-col items-center rounded-lg bg-blue-50 p-3 md:p-4">
          <h3 className="text-lg font-bold text-blue-600 md:text-xl">
            Tổng tiền: {booking.totalAmount.toLocaleString('vi-VN')} VND
          </h3>
        </div>
      </div>

      {/* Payment Section - Only show if payment URL exists */}
      {paymentUrl && (
        <div className={`w-full ${isMobile ? 'order-first' : 'lg:w-1/2 xl:w-3/5'}`}>
          <div className="sticky top-4">
            {showPaymentDialog && (
              <div className="relative min-h-[500px] overflow-hidden rounded-lg border">
                {iframeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                    <span className="ml-3">Đang tải cổng thanh toán...</span>
                  </div>
                )}
                <iframe
                  src={paymentUrl}
                  className={`h-[500px] w-full border-0 ${iframeLoading ? 'invisible' : 'visible'}`}
                  onLoad={handleIframeLoad}
                  title="Payment Gateway"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="payment *"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckoutPage
