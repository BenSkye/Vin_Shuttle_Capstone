'use client'

import React, { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import dayjs from 'dayjs'
import { Typography } from 'antd'
import { AvailableVehicle, BookingHourRequest, BookingResponse } from '@/interface/booking.interface'
import { bookingRoute } from '@/service/booking.service'
import { RouteResponse } from '@/service/mapScenic'
import { vehicleSearchRoute } from '@/service/search.service'

// Dynamic import components
const { Title } = Typography


const RouteDateTimeSelection = dynamic(
  () => import('@/views/Ride/components/routedatetimeselection'),
  { ssr: false }
)
const LocationSelection = dynamic(() => import('@/views/Ride/components/locationselection'), {
  ssr: false,
})
const CreateRoute = dynamic(() => import('@/components/map/createRoute'), { ssr: false })
const CheckoutPage = dynamic(() => import('@/views/Ride/components/checkoutpage'), {
  ssr: false,
})
const VehicleSelection = dynamic(() => import('@/views/Ride/components/vehicleselection'), {
  ssr: false,
})

const RoutesBooking = () => {
  // Define all possible steps in the booking flow
  const [currentStep, setCurrentStep] = useState<'datetime' | 'route' | 'vehicle' | 'location' | 'checkout'>('datetime')

  // State for date and time selection
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null)
  const [duration, setDuration] = useState<number>(60)

  // State for vehicle selection
  const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<BookingHourRequest['vehicleCategories']>([])

  // State for location and route selection
  const [startPoint, setStartPoint] = useState<{
    position: { lat: number; lng: number }
    address: string
  }>({
    position: { lat: 10.840405, lng: 106.843424 },
    address: '',
  })
  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(null)

  // State for UI management
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null)

  // Handler for date selection
  const handleDateChange = useCallback((date: dayjs.Dayjs | null) => {
    setSelectedDate(date)
    console.log('Date changed to:', date ? date.format('YYYY-MM-DD') : 'None')
  }, [])

  // Handler for time selection
  const handleStartTimeChange = useCallback((time: dayjs.Dayjs | null) => {
    setStartTime(time)
    console.log('Start time changed to:', time ? time.format('HH:mm') : 'None')
  }, [])

  // Handler for duration selection
  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration)
    console.log('Duration changed to:', newDuration, 'minutes')

    // Calculate and log the end time whenever duration changes
    if (startTime) {
      const endTime = startTime.add(newDuration, 'minute')
      console.log('Updated end time:', endTime.format('HH:mm'))
    }
  }, [startTime])

  // Handler for location selection
  const handleLocationChange = useCallback((newPosition: { lat: number; lng: number }, newAddress: string) => {
    setStartPoint({
      position: newPosition,
      address: newAddress,
    })
  }, [])

  // Handler for vehicle selection
  const handleVehicleSelection = useCallback((categoryId: string, quantity: number) => {
    setSelectedVehicles((prev) => {
      const existing = prev.find((v) => v.categoryVehicleId === categoryId)
      if (existing) {
        if (quantity === 0) {
          return prev.filter((v) => v.categoryVehicleId !== categoryId)
        }
        return prev.map((v) => (v.categoryVehicleId === categoryId ? { ...v, quantity } : v))
      }
      const vehicle = availableVehicles.find((v) => v.vehicleCategory._id === categoryId)
      return quantity > 0
        ? [
          ...prev,
          {
            categoryVehicleId: categoryId,
            quantity,
            name: vehicle?.vehicleCategory.name || 'Unknown Vehicle',
          },
        ]
        : prev
    })
  }, [availableVehicles])

  // Handler for route selection
  const handleRouteSelection = useCallback((route: RouteResponse) => {
    setSelectedRoute(route)
    console.log('Selected route in parent component:', route._id)
  }, [])

  // Handler to detect user's current location
  const detectUserLocation = useCallback(async () => {
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

  // Function to fetch available vehicles based on selected route and time
  const fetchAvailableVehicles = useCallback(async () => {
    if (!selectedDate || !startTime || !selectedRoute) {
      setError('Vui lòng chọn đầy đủ thông tin ngày, giờ và lộ trình')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await vehicleSearchRoute(
        selectedDate.format('YYYY-MM-DD'),
        startTime.format('HH:mm'),
        selectedRoute._id
      )

      console.log('Available vehicles:', response)
      setAvailableVehicles(Array.isArray(response) ? response : [response])
      setCurrentStep('vehicle')
      return true
    } catch (error) {
      console.error('Error fetching available vehicles:', error)
      setError(error instanceof Error ? error.message : 'Không thể tìm thấy phương tiện phù hợp')
      return false
    } finally {
      setLoading(false)
    }
  }, [selectedDate, startTime, selectedRoute])

  // Function to handle final booking submission
  const handleConfirmBooking = useCallback(async () => {
    if (!selectedDate || !startTime || !selectedRoute || !startPoint.address || selectedVehicles.length === 0) {
      setError('Vui lòng điền đầy đủ thông tin đặt xe')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await bookingRoute({
        date: selectedDate.format('YYYY-MM-DD'),
        startTime: startTime.format('HH:mm'),
        scenicRouteId: selectedRoute._id,
        startPoint: {
          position: {
            lat: startPoint.position.lat,
            lng: startPoint.position.lng,
          },
          address: startPoint.address,
        },
        vehicleCategories: selectedVehicles,
        paymentMethod: 'pay_os',
      })

      console.log('Booking response:', response)
      setBookingResponse(response)
      setCurrentStep('checkout')
    } catch (error) {
      console.error('Error booking route:', error)
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt xe. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, startTime, selectedRoute, startPoint, selectedVehicles])

  // Handler for navigating to the next step
  const handleNextStep = useCallback(() => {
    if (currentStep === 'datetime') {
      if (!selectedDate || !startTime) {
        setError('Vui lòng chọn ngày và giờ')
        return
      }
      setError(null)
      setCurrentStep('route')
    } else if (currentStep === 'route') {
      if (!selectedRoute) {
        setError('Vui lòng chọn lộ trình')
        return
      }
      setError(null)
      fetchAvailableVehicles()
    } else if (currentStep === 'vehicle') {
      if (selectedVehicles.length === 0) {
        setError('Vui lòng chọn loại xe')
        return
      }
      setError(null)
      setCurrentStep('location')
    } else if (currentStep === 'location') {
      if (!startPoint.address) {
        setError('Vui lòng chọn địa điểm đón')
        return
      }
      setError(null)
      handleConfirmBooking()
    }
  }, [
    currentStep,
    selectedDate,
    startTime,
    selectedRoute,
    selectedVehicles,
    startPoint.address,
    fetchAvailableVehicles,
    handleConfirmBooking
  ])

  // Handler for navigating to the previous step
  const handleBackStep = useCallback(() => {
    if (currentStep === 'route') {
      setCurrentStep('datetime')
    } else if (currentStep === 'vehicle') {
      setCurrentStep('route')
    } else if (currentStep === 'location') {
      setCurrentStep('vehicle')
    } else if (currentStep === 'checkout') {
      setCurrentStep('location')
    }
  }, [currentStep])

  // Render content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'datetime':
        return (
          <div className="space-y-6">
            <RouteDateTimeSelection
              selectedDate={selectedDate}
              startTime={startTime}
              onDateChange={handleDateChange}
              onStartTimeChange={handleStartTimeChange}
              duration={duration}
              onDurationChange={handleDurationChange}
            />
            <div className="flex justify-end">
              <button
                onClick={handleNextStep}
                disabled={!selectedDate || !startTime || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
              >
                {loading ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </div>
          </div>
        )
      case 'route':
        return (
          <div className="space-y-6">
            <CreateRoute onRouteSelect={handleRouteSelection} selectedRoute={selectedRoute} />
            <div className="flex justify-between">
              <button
                onClick={handleBackStep}
                className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={!selectedRoute || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
              >
                {loading ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </div>
          </div>
        )
      case 'vehicle':
        return (
          <div className="space-y-6">
            <VehicleSelection
              availableVehicles={availableVehicles}
              selectedVehicles={selectedVehicles}
              onSelectionChange={handleVehicleSelection}
            />
            <div className="flex justify-between">
              <button
                onClick={handleBackStep}
                className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={selectedVehicles.length === 0 || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
              >
                {loading ? 'Đang xử lý...' : 'Tiếp tục'}
              </button>
            </div>
          </div>
        )
      case 'location':
        return (
          <div className="space-y-6">
            <LocationSelection
              startPoint={startPoint}
              onLocationChange={handleLocationChange}
              loading={loading}
              detectUserLocation={detectUserLocation}
            />
            <div className="flex justify-between">
              <button
                onClick={handleBackStep}
                className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={!startPoint.address || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt xe'}
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

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Title level={2} className="mb-6 text-center text-lg sm:mb-8 sm:text-xl md:text-2xl">
        Đặt xe theo tuyến
      </Title>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div
            className={`flex-1 text-center ${currentStep === 'datetime' ? 'text-blue-500' : currentStep === 'route' || currentStep === 'vehicle' || currentStep === 'location' || currentStep === 'checkout' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${currentStep === 'datetime' || currentStep === 'route' || currentStep === 'vehicle' || currentStep === 'location' || currentStep === 'checkout' ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: '100%' }}
              />
            </div>
            <span>Chọn thời gian</span>
          </div>

          <div
            className={`flex-1 text-center ${currentStep === 'route' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${currentStep === 'route' || currentStep === 'vehicle' || currentStep === 'location' || currentStep === 'checkout'
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
                  }`}
                style={{
                  width: currentStep === 'route' || currentStep === 'vehicle' || currentStep === 'location' || currentStep === 'checkout'
                    ? '100%'
                    : '0%'
                }}
              />
            </div>
            <span>Chọn lộ trình</span>
          </div>

          <div
            className={`flex-1 text-center ${currentStep === 'vehicle' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${currentStep === 'vehicle' || currentStep === 'location' || currentStep === 'checkout'
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
                  }`}
                style={{
                  width: currentStep === 'vehicle' || currentStep === 'location' || currentStep === 'checkout'
                    ? '100%'
                    : '0%'
                }}
              />
            </div>
            <span>Chọn xe</span>
          </div>

          <div
            className={`flex-1 text-center ${currentStep === 'location' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${currentStep === 'location' || currentStep === 'checkout' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                style={{
                  width: currentStep === 'location' || currentStep === 'checkout' ? '100%' : '0%'
                }}
              />
            </div>
            <span>Chọn địa điểm</span>
          </div>

          <div
            className={`flex-1 text-center ${currentStep === 'checkout' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${currentStep === 'checkout' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                style={{ width: currentStep === 'checkout' ? '100%' : '0%' }}
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

export default RoutesBooking
