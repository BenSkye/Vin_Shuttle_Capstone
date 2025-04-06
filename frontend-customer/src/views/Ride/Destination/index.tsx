'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Radio, Space, Typography } from 'antd'
import CheckoutPage from '@/views/Ride/components/checkoutpage'
import SharedLocation from '@/views/Ride/components/sharedLocation'

import { AvailableVehicle, BookingDestinationRequest, BookingResponse } from '@/interface/booking.interface'
import { bookingDestination } from '@/service/booking.service'
import { vehicleSearchDestination } from '@/service/search.service'
import { PaymentMethod } from '@/constants/payment.enum'

// Dynamic import components outside the component to prevent reloading
const { Title } = Typography
const VehicleSelection = dynamic(() => import('@/views/Ride/components/vehicleselection'), {
  ssr: false,
})
//yessir

const DestinationBookingPage = () => {
  const [currentStep, setCurrentStep] = useState<'location' | 'vehicle' | 'payment' | 'checkout'>('location')
  const [passengerCount, setPassengerCount] = useState(1)
  const [startPoint, setStartPoint] = useState<{
    position: { lat: number; lng: number }
    address: string
  }>({
    position: { lat: 10.840405, lng: 106.843424 },
    address: '',
  })
  const [endPoint, setEndPoint] = useState<{
    position: { lat: number; lng: number }
    address: string
  }>({
    position: { lat: 10.8468, lng: 106.8375 },
    address: '',
  })

  const [loading, setLoading] = useState(false)
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null)
  const [isBrowser, setIsBrowser] = useState(false)
  const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<
    {
      categoryVehicleId: string
      name: string
      quantity: number
    }[]
  >([])
  const [error, setError] = useState<string | null>(null)
  // Set default values for estimated distance and duration
  const [estimatedDistance, setEstimatedDistance] = useState<number>(0)
  const [durationEstimate, setDurationEstimate] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PAY_OS)


  // Check if code is running in browser
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  const handlePaymentMethodChange = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method)
  }, [])

  const handleStartLocationChange = useCallback((
    newPosition: { lat: number; lng: number },
    newAddress: string
  ) => {
    setStartPoint({
      position: newPosition,
      address: newAddress,
    })
  }, [])

  const handleEndLocationChange = useCallback((
    newPosition: { lat: number; lng: number },
    newAddress: string
  ) => {
    setEndPoint({
      position: newPosition,
      address: newAddress,
    })
  }, [])
  //

  // const calculateDistance = useCallback(() => {
  //   // Calculate distance in km between two points using Haversine formula
  //   const R = 6371 // Radius of the Earth in km
  //   const dLat = ((endPoint.position.lat - startPoint.position.lat) * Math.PI) / 180
  //   const dLon = ((endPoint.position.lng - startPoint.position.lng) * Math.PI) / 180
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos((startPoint.position.lat * Math.PI) / 180) *
  //     Math.cos((endPoint.position.lat * Math.PI) / 180) *
  //     Math.sin(dLon / 2) *
  //     Math.sin(dLon / 2)
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  //   const distance = R * c

  //   // Calculate estimated duration (rough estimate: 1 km = 2 minutes)
  //   const duration = Math.ceil(distance * 2)

  //   setEstimatedDistance(parseFloat(distance.toFixed(2)) || 2)
  //   setDurationEstimate(duration || 5)

  //   return { distance, duration }
  // }, [startPoint.position.lat, startPoint.position.lng, endPoint.position.lat, endPoint.position.lng])

  const detectUserLocation = useCallback(async () => {
    if (!isBrowser) return // Only run in browser

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
          maximumAge: 0
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
  }, [isBrowser])

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

  const handleVehicleSelection = useCallback((categoryId: string, quantity: number) => {
    setSelectedVehicles((prev) => {
      const existing = prev.find((v) => v.categoryVehicleId === categoryId)
      const vehicleCategory = availableVehicles.find(v => v.vehicleCategory._id === categoryId)
      const name = vehicleCategory ? vehicleCategory.vehicleCategory.name : ''

      if (existing) {
        if (quantity === 0) {
          return prev.filter((v) => v.categoryVehicleId !== categoryId)
        }
        return prev.map((v) => (v.categoryVehicleId === categoryId ? { ...v, quantity } : v))
      }
      return quantity > 0 ? [...prev, { categoryVehicleId: categoryId, quantity, name }] : prev
    })
  }, [availableVehicles])

  const fetchAvailableVehicles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Use calculateDistance to update estimatedDistance and estimatedDuration
      // calculateDistance()

      if (!startPoint.address || !endPoint.address) {
        setError('Vui lòng chọn địa điểm đón và trả khách')
        setLoading(false)
        return false
      }

      console.log('Calling vehicleSearchDestination with params:', {
        estimatedDuration: durationEstimate,
        estimatedDistance: estimatedDistance,
        endPoint: endPoint.position,
        startPoint: startPoint.position,
      })

      // Call API to get available vehicles using vehicleSearchDestination
      const vehicles = await vehicleSearchDestination(
        durationEstimate, // Use default value if not available
        estimatedDistance, // Use default value if not available
        endPoint.position,
        startPoint.position
      )

      console.log('vehicleSearchDestination response:', vehicles)
      setAvailableVehicles(Array.isArray(vehicles) ? vehicles : [vehicles])
      setCurrentStep('vehicle')
      return true
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setError(error instanceof Error ? error.message : 'Không thể tìm thấy phương tiện phù hợp')
      return false
    } finally {
      setLoading(false)
    }
  }, [startPoint, endPoint, durationEstimate, estimatedDistance])

  const handleConfirmBooking = useCallback(async () => {
    if (selectedVehicles.length === 0) {
      setError('Vui lòng chọn loại xe')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Prepare the payload for booking destination
      const payload: BookingDestinationRequest = {
        startPoint: startPoint,
        endPoint: endPoint,
        durationEstimate: durationEstimate,
        distanceEstimate: estimatedDistance,
        vehicleCategories: {
          categoryVehicleId: selectedVehicles[0].categoryVehicleId,
          name: selectedVehicles[0].name
        },
        paymentMethod: paymentMethod,
      }

      console.log('Calling bookingDestination with payload:', payload)

      const response = await bookingDestination(payload)
      console.log('bookingDestination response:', response)

      setBookingResponse(response)
      setCurrentStep('checkout')
    } catch (error) {
      console.error('Error creating booking:', error)
      setError(error instanceof Error ? error.message : 'Không thể đặt xe')
    } finally {
      setLoading(false)
    }
  }, [selectedVehicles, startPoint, endPoint, durationEstimate, estimatedDistance, paymentMethod])

  const handleNextStep = useCallback(() => {
    if (currentStep === 'location' && startPoint.address && endPoint.address) {
      fetchAvailableVehicles()
    } else if (currentStep === 'vehicle' && selectedVehicles.length > 0) {
      setCurrentStep('payment')
    } else if (currentStep === 'payment') {
      handleConfirmBooking()
    }
  }, [currentStep, startPoint.address, endPoint.address, selectedVehicles.length, fetchAvailableVehicles, handleConfirmBooking])

  const handleBackStep = useCallback(() => {
    if (currentStep === 'vehicle') {
      setCurrentStep('location')
    } else if (currentStep === 'payment') {
      setCurrentStep('vehicle')
    }
    else if (currentStep === 'checkout') {
      setCurrentStep('payment')
    }
  }, [currentStep])

  const renderStepContent = () => {
    switch (currentStep) {
      case 'location':
        return (
          <div className="space-y-6">
            {isBrowser && (
              <SharedLocation
                startPoint={startPoint}
                endPoint={endPoint}
                onStartLocationChange={handleStartLocationChange}
                onEndLocationChange={handleEndLocationChange}
                loading={loading}
                detectUserLocation={detectUserLocation}
                numberOfSeats={passengerCount}
                onNumberOfSeatsChange={setPassengerCount}
                setEstimateDistance={setEstimatedDistance}
                setEstimateDuration={setDurationEstimate}
              />
            )}
            <div className="flex justify-end">
              <button
                onClick={handleNextStep}
                disabled={!startPoint.address || !endPoint.address || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                aria-label="Tìm xe"
                tabIndex={0}
              >
                {loading ? 'Đang xử lý...' : 'Tìm xe'}
              </button>
            </div>
          </div>
        )
      case 'vehicle':
        return (
          <div className="space-y-6">
            {isBrowser && (
              <VehicleSelection
                availableVehicles={availableVehicles}
                selectedVehicles={selectedVehicles}
                onSelectionChange={handleVehicleSelection}
              />
            )}
            <div className="flex justify-between">
              <button
                onClick={handleBackStep}
                className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600 transition-colors"
                aria-label="Quay lại trang chọn địa điểm"
                tabIndex={0}
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={selectedVehicles.length === 0 || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                aria-label="Xác nhận đặt xe"
                tabIndex={0}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt xe'}
              </button>
            </div>
          </div>
        )
      case 'payment':
        return (
          <div className="space-y-4">
            {/* <Title level={4} className="text-center">
              Chọn phương thức thanh toán
            </Title> */}
            <Radio.Group
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              value={paymentMethod}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                <Radio value="pay_os" className="w-full p-4 border rounded-lg">
                  <div className="flex items-center">
                    <img src="/images/payos-logo.png" alt="PayOS" className="h-8 mr-3" />
                    <span>Thanh toán qua PayOS</span>
                  </div>
                </Radio>
                <Radio value="momo" className="w-full p-4 border rounded-lg">
                  <div className="flex items-center">
                    <img src="/images/momo-logo.png" alt="Momo" className="h-8 mr-3" />
                    <span>Ví điện tử Momo</span>
                  </div>
                </Radio>
                <Radio value="cash" className="w-full p-4 border rounded-lg">
                  <div className="flex items-center">
                    <img src="/images/cash-logo.png" alt="Cash" className="h-8 mr-3" />
                    <span>Thanh toán tiền mặt</span>
                  </div>
                </Radio>
              </Space>
            </Radio.Group>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleBackStep}
                className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600 transition-colors"
                aria-label="Quay lại chọn địa điểm"
                tabIndex={0}
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 transition-colors"
                aria-label="Xác nhận thanh toán"
                tabIndex={0}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )
      case 'checkout':
        return (
          <div className="space-y-6">
            {bookingResponse && (
              <CheckoutPage bookingResponse={bookingResponse} />
            )}
            <div className="flex justify-start">
              <button
                onClick={handleBackStep}
                className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600 transition-colors"
                aria-label="Quay lại chọn xe"
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

  const getStepProgress = (step: 'location' | 'vehicle' | 'payment' | 'checkout') => {
    const steps = ['location', 'vehicle', 'payment', 'checkout']
    const currentIndex = steps.indexOf(currentStep)
    const stepIndex = steps.indexOf(step)

    if (stepIndex < currentIndex) return 100
    if (stepIndex === currentIndex) return 100
    return 0
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Title level={2} className="mb-6 text-center text-lg sm:mb-8 sm:text-xl md:text-2xl">
        Đặt xe điểm đến
      </Title>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex-1 text-center ${getStepProgress('location') > 0 ? 'text-blue-500' : 'text-gray-500'}`}>
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('location') > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: `${getStepProgress('location')}%` }}
              />
            </div>
            <span>Chọn địa điểm</span>
          </div>

          <div className={`flex-1 text-center ${getStepProgress('vehicle') > 0 ? 'text-blue-500' : 'text-gray-500'}`}>
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('vehicle') > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: `${getStepProgress('vehicle')}%` }}
              />
            </div>
            <span>Chọn xe</span>
          </div>

          <div className={`flex-1 text-center ${getStepProgress('payment') > 0 ? 'text-blue-500' : 'text-gray-500'}`}>
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('payment') > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: `${getStepProgress('payment')}%` }}
              />
            </div>
            <span>Phương thức thanh toán</span>
          </div>

          <div className={`flex-1 text-center ${getStepProgress('checkout') > 0 ? 'text-blue-500' : 'text-gray-500'}`}>
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('checkout') > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: `${getStepProgress('checkout')}%` }}
              />
            </div>
            <span>Thanh toán</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-lg">{renderStepContent()}</div>
    </div>
  )
}

export default DestinationBookingPage