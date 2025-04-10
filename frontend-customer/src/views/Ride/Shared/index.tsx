'use client'

import React, { useCallback, useState } from 'react'

import { Radio, Space, Typography } from 'antd'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import { PaymentMethod } from '@/constants/payment.enum'

import { BookingResponse, BookingSharedRequest } from '@/interface/booking.interface'

import { bookingShared } from '../../../service/booking.service'
import CheckoutPage from '../components/checkoutpage'
import SharedLocation from '../components/sharedLocation'

const { Title } = Typography
// Define location point type for reuse
type LocationPoint = {
  position: { lat: number; lng: number }
  address: string
}

const SharedBookingFlow = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'location' | 'confirmation' | 'checkout'>('location')
  const [startPoint, setStartPoint] = useState<LocationPoint>({
    position: { lat: 10.840405, lng: 106.843424 },
    address: '',
  })
  const [endPoint, setEndPoint] = useState<LocationPoint>({
    position: { lat: 10.840405, lng: 106.843424 },
    address: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estimatedDistance, setEstimatedDistance] = useState<number>(2)
  const [estimatedDuration, setEstimatedDuration] = useState<number>(5)
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null)
  const [numberOfSeats, setNumberOfSeats] = useState<number>(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PAY_OS)

  const handlePaymentMethodChange = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method)
    // Ensure distance and duration estimates are properly set
    // This is to fix the issue where these values are not being passed correctly
    // when the payment method is PayOS
    if (method === PaymentMethod.PAY_OS) {
      // Make sure we have valid values for distance and duration
      if (estimatedDistance <= 0) {
        setEstimatedDistance(2) // Default value if not set
      }
      if (estimatedDuration <= 0) {
        setEstimatedDuration(5) // Default value if not set
      }
    }
  }, [estimatedDistance, estimatedDuration])

  const handleStartLocationChange = useCallback(
    (position: { lat: number; lng: number }, address: string) => {
      setStartPoint({ position, address })
      setLoading(false)

      // If both start and end points are set, ensure we have valid distance and duration
      if (endPoint.address && position.lat && position.lng && endPoint.position.lat && endPoint.position.lng) {
        // If the SharedLocation component doesn't update these values automatically,
        // we'll set default values to ensure they're not zero
        if (estimatedDistance <= 0) {
          setEstimatedDistance(2)
        }
        if (estimatedDuration <= 0) {
          setEstimatedDuration(5)
        }
      }
    },
    [endPoint, estimatedDistance, estimatedDuration]
  )

  const handleEndLocationChange = useCallback(
    (position: { lat: number; lng: number }, address: string) => {
      setEndPoint({ position, address })
      setLoading(false)

      // If both start and end points are set, ensure we have valid distance and duration
      if (startPoint.address && position.lat && position.lng && startPoint.position.lat && startPoint.position.lng) {
        // If the SharedLocation component doesn't update these values automatically,
        // we'll set default values to ensure they're not zero
        if (estimatedDistance <= 0) {
          setEstimatedDistance(2)
        }
        if (estimatedDuration <= 0) {
          setEstimatedDuration(5)
        }
      }
    },
    [startPoint, estimatedDistance, estimatedDuration]
  )

  const handleDetectUserLocation = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!navigator.geolocation) {
        throw new Error('Trình duyệt của bạn không hỗ trợ định vị')
      }

      // Get position from geolocation API
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords

      // Get the address from coordinates
      const address = await fetchAddress(latitude, longitude)

      // Update the start point with both position and address
      setStartPoint({
        position: { lat: latitude, lng: longitude },
        address: address || 'Vị trí hiện tại của bạn',
      })
    } catch (error) {
      console.error('Error getting location:', error)
      let errorMessage = 'Không thể lấy vị trí của bạn'

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn đã từ chối cho phép truy cập vị trí'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Không thể lấy thông tin vị trí'
            break
          case error.TIMEOUT:
            errorMessage = 'Yêu cầu vị trí đã hết thời gian chờ'
            break
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Helper function to get address from coordinates
  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lng}&zoom=18&format=json`
      )
      const data = await response.json()
      return data.display_name || 'Vị trí hiện tại của bạn'
    } catch (error) {
      console.error('Error fetching address:', error)
      return 'Vị trí hiện tại của bạn'
    }
  }

  // const calculateDistance = useCallback(() => {
  //     // Early return if points are not valid
  //     if (!startPoint.position.lat || !endPoint.position.lat) {
  //         return { distance: 2, duration: 5 }
  //     }

  //     // Calculate distance in km between two points using Haversine formula
  //     const R = 6371 // Radius of the Earth in km
  //     const dLat = ((endPoint.position.lat - startPoint.position.lat) * Math.PI) / 180
  //     const dLon = ((endPoint.position.lng - startPoint.position.lng) * Math.PI) / 180
  //     const a =
  //         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //         Math.cos((startPoint.position.lat * Math.PI) / 180) *
  //         Math.cos((endPoint.position.lat * Math.PI) / 180) *
  //         Math.sin(dLon / 2) *
  //         Math.sin(dLon / 2)
  //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  //     const distance = R * c

  //     // Calculate estimated duration (rough estimate: 1 km = 2 minutes)
  //     const duration = Math.ceil(distance * 2)

  //     setEstimatedDistance(parseFloat(distance.toFixed(2)) || 2)
  //     setEstimatedDuration(duration || 5)

  //     return { distance, duration }
  // }, [startPoint.position, endPoint.position])

  const handleNumberOfSeatsChange = useCallback((seats: number) => {
    setNumberOfSeats(seats)
  }, [])

  const handleConfirmBooking = useCallback(async () => {
    if (!startPoint.address || !endPoint.address) {
      setError('Vui lòng chọn cả điểm đón và điểm đến')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Ensure we have valid values for distance and duration
      const validDistance = estimatedDistance > 0 ? estimatedDistance : 2
      const validDuration = estimatedDuration > 0 ? estimatedDuration : 5

      const payload: BookingSharedRequest = {
        startPoint,
        endPoint,
        durationEstimate: validDuration,
        distanceEstimate: validDistance,
        numberOfSeat: numberOfSeats,
        paymentMethod: paymentMethod,
      }

      console.log('Booking payload:', payload) // Add logging to debug

      const response = await bookingShared(payload)
      setBookingResponse(response)
      setCurrentStep('checkout')
    } catch (error) {
      console.error('Error creating booking:', error)
      setError(error instanceof Error ? error.message : 'Không thể đặt xe')
    } finally {
      setLoading(false)
    }
  }, [startPoint, endPoint, estimatedDistance, estimatedDuration, numberOfSeats, paymentMethod])

  const handleNextStep = useCallback(() => {
    if (currentStep === 'location' && startPoint.address && endPoint.address) {
      // Validate distance and duration estimates before proceeding
      if (estimatedDistance <= 0 || estimatedDuration <= 0) {
        setError('Vui lòng chọn địa điểm hợp lệ để tính toán khoảng cách và thời gian')
        return
      }
      setCurrentStep('confirmation')
    } else if (currentStep === 'confirmation') {
      handleConfirmBooking()
    }
  }, [currentStep, startPoint.address, endPoint.address, estimatedDistance, estimatedDuration, handleConfirmBooking])

  const handleBackStep = useCallback(() => {
    if (currentStep === 'confirmation') {
      setCurrentStep('location')
    } else if (currentStep === 'checkout') {
      setCurrentStep('confirmation')
    }
  }, [currentStep])

  const renderStepContent = () => {
    switch (currentStep) {
      case 'location':
        return (
          <div className="space-y-6">
            <SharedLocation
              startPoint={startPoint}
              endPoint={endPoint}
              onStartLocationChange={handleStartLocationChange}
              onEndLocationChange={handleEndLocationChange}
              detectUserLocation={handleDetectUserLocation}
              loading={loading}
              numberOfSeats={numberOfSeats}
              onNumberOfSeatsChange={handleNumberOfSeatsChange}
              setEstimateDistance={setEstimatedDistance}
              setEstimateDuration={setEstimatedDuration}
            />
            <Radio.Group
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              value={paymentMethod}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                <Radio value={PaymentMethod.PAY_OS} className="w-full rounded-lg border p-4">
                  <div className="flex items-center">
                    <img src="/images/logo-payos.png" alt="PayOS" className="mr-3 h-8" />
                    <span>Thanh toán qua PayOS</span>
                  </div>
                </Radio>
                <Radio value={PaymentMethod.MOMO} className="w-full rounded-lg border p-4">
                  <div className="flex items-center">
                    <img src="/images/logo_momo.png" alt="Momo" className="mr-3 h-8" />
                    <span>Ví điện tử Momo</span>
                  </div>
                </Radio>
                {/* <Radio value="cash" className="w-full rounded-lg border p-4">
                  <div className="flex items-center">
                    <img src="/images/cash-logo.png" alt="Cash" className="mr-3 h-8" />
                    <span>Thanh toán tiền mặt</span>
                  </div>
                </Radio> */}
              </Space>
            </Radio.Group>
            <div className="flex justify-end">
              <button
                onClick={handleNextStep}
                disabled={!startPoint.address || !endPoint.address || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
                aria-label="Tiếp tục đặt xe"
                tabIndex={0}
              >
                {loading ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </div>
          </div>
        )

      case 'confirmation':
        return (
          <div className="space-y-6">
            <Title level={4} className="text-center">
              Xác nhận thông tin đặt xe
            </Title>

            <div className="rounded-lg border border-gray-200 p-6">
              <div className="mb-6 space-y-4">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Điểm đón</h3>
                    <p className="text-gray-600">{startPoint.address}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Điểm đến</h3>
                    <p className="text-gray-600">{endPoint.address}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Số lượng chỗ</h3>
                    <p className="text-gray-600">{numberOfSeats} chỗ</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Khoảng cách & thời gian</h3>
                    <p className="text-gray-600">
                      {estimatedDistance} km (~{estimatedDuration} phút)
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Phương thức thanh toán</h3>
                    <p className="text-gray-600">
                      {paymentMethod === PaymentMethod.PAY_OS
                        ? 'Thanh toán qua PayOS'
                        : paymentMethod === PaymentMethod.MOMO
                          ? 'Ví điện tử Momo'
                          : 'Thanh toán tiền mặt'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBackStep}
                className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
                aria-label="Quay lại trang chọn địa điểm"
                tabIndex={0}
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
                aria-label="Xác nhận đặt xe"
                tabIndex={0}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt xe'}
              </button>
            </div>
          </div>
        )

      case 'checkout':
        return (
          <div className="space-y-6">
            {bookingResponse && <CheckoutPage bookingResponse={bookingResponse} />}
            <div className="flex justify-start">
              <button
                onClick={handleBackStep}
                className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
                aria-label="Quay lại trang xác nhận"
                tabIndex={0}
              >
                Quay lại
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }
  //yessir
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Title level={2} className="mb-6 text-center text-lg sm:mb-8 sm:text-xl md:text-2xl">
        Đặt xe đi chung
      </Title>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div
            className={`flex-1 text-center ${currentStep === 'location' ? 'text-blue-500' : 'text-gray-500'
              }`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${currentStep === 'location' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                style={{ width: '100%' }}
              />
            </div>
            <span className="hidden sm:inline">Chọn địa điểm</span>
          </div>
          <div
            className={`flex-1 text-center ${currentStep === 'confirmation' ? 'text-blue-500' : 'text-gray-500'
              }`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${currentStep === 'confirmation' || currentStep === 'checkout' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                style={{ width: currentStep === 'confirmation' || currentStep === 'checkout' ? '100%' : '0%' }}
              />
            </div>
            <span className="hidden sm:inline">Xác nhận</span>
          </div>
          <div
            className={`flex-1 text-center ${currentStep === 'checkout' ? 'text-blue-500' : 'text-gray-500'
              }`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${currentStep === 'checkout' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                style={{ width: currentStep === 'checkout' ? '100%' : '0%' }}
              />
            </div>
            <span className="hidden sm:inline">Thanh toán</span>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-lg">{renderStepContent()}</div>
    </div>
  )
}

export default SharedBookingFlow
