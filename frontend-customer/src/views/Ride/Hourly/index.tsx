'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { notification, Card, Typography, Alert } from 'antd'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'

import { BookingHourDuration } from '@/constants/booking.constants'

import CheckoutPage from '@/views/Ride/components/checkoutpage'
import DateTimeSelection from '@/views/Ride/components/datetimeselection'
import VehicleSelection from '@/views/Ride/components/vehicleselection'

import { AvailableVehicle, BookingHourRequest, BookingResponse } from '@/interface/booking.interface'
import { bookingHour } from '@/service/booking.service'
import { vehicleSearchHour } from '@/service/search.service'

const LocationSelection = dynamic(() => import('@/views/Ride/components/locationselection'), {
  ssr: false,
})

const { Title } = Typography

// Define location point type for reuse
type LocationPoint = {
  position: { lat: number; lng: number }
  address: string
}

const HourlyBookingPage = () => {
  // Define steps for the booking flow
  const [currentStep, setCurrentStep] = useState<'datetime' | 'vehicle' | 'location' | 'checkout'>('datetime')
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null)
  const [duration, setDuration] = useState<number>(60)
  const [loading, setLoading] = useState(false)
  const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<BookingHourRequest['vehicleCategories']>([])
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [startPoint, setStartPoint] = useState<LocationPoint>({
    position: { lat: 10.840405, lng: 106.843424 },
    address: '',
  })
  const [booking, setBooking] = useState<BookingHourRequest>({
    startPoint: { position: { lat: 0, lng: 0 }, address: '' },
    date: '',
    startTime: '',
    durationMinutes: 0,
    vehicleCategories: [],
    paymentMethod: 'pay_os',
  })

  // Handle date and time selection
  const handleDateChange = useCallback((date: dayjs.Dayjs | null) => {
    setSelectedDate(date)
  }, [])

  const handleStartTimeChange = useCallback((time: dayjs.Dayjs | null) => {
    setStartTime(time)
  }, [])

  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration)
  }, [])

  // Vehicle selection handler
  const handleVehicleSelection = useCallback((categoryId: string, quantity: number) => {
    setSelectedVehicles((prev) => {
      const existing = prev.find((v) => v.categoryVehicleId === categoryId)
      if (existing) {
        if (quantity === 0) {
          return prev.filter((v) => v.categoryVehicleId !== categoryId)
        }
        return prev.map((v) => (v.categoryVehicleId === categoryId ? { ...v, quantity } : v))
      }
      return quantity > 0 ? [...prev, { categoryVehicleId: categoryId, quantity, name: "" }] : prev
    })
  }, [])

  // Location handlers
  const handleLocationChange = useCallback((newPosition: { lat: number; lng: number }, newAddress: string) => {
    setStartPoint({
      position: newPosition,
      address: newAddress,
    })
  }, [])

  const detectUserLocation = useCallback(async () => {
    if (typeof window === 'undefined') return
    setLoading(true)
    setError(null)

    try {
      if (!navigator.geolocation) {
        throw new Error('Trình duyệt của bạn không hỗ trợ định vị')
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const { latitude, longitude } = position.coords

      // Get address from the coordinates using reverse geocoding
      const address = await fetchAddress(latitude, longitude)

      // Update location in state
      setStartPoint({
        position: { lat: latitude, lng: longitude },
        address: address,
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

  // Fetch available vehicles
  const fetchAvailableVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!selectedDate || !startTime) {
        throw new Error('Bạn cần chọn ngày và giờ trước khi tìm kiếm xe.')
      }

      const date = selectedDate.format('YYYY-MM-DD')
      const startTimeString = dayjs(startTime).format('HH:mm')
      const response = await vehicleSearchHour(date, startTimeString, duration)

      if (!response || (Array.isArray(response) && response.length === 0)) {
        throw new Error('Không tìm thấy xe khả dụng cho thời gian đã chọn.')
      }

      setAvailableVehicles(Array.isArray(response) ? response : [response])
      setCurrentStep('vehicle')
      return true
    } catch (error: unknown) {
      console.error('Lỗi khi tìm kiếm xe:', error)
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách xe.'
      setError(errorMessage)
      setAvailableVehicles([])
      return false
    } finally {
      setLoading(false)
    }
  }, [selectedDate, startTime, duration])

  // Submit booking
  const handleSubmitBooking = useCallback(async () => {
    if (!startPoint.address.trim()) {
      setError('Vui lòng chọn địa điểm đón')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await bookingHour(booking)
      setBookingResponse(response)
      setCurrentStep('checkout')
      return response
    } catch (error: unknown) {
      console.error('Lỗi đặt xe:', error)
      setError(error instanceof Error ? error.message : 'Không thể đặt xe')
      throw error
    } finally {
      setLoading(false)
    }
  }, [booking, startPoint.address])

  // Navigation handlers
  const handleNextStep = useCallback(() => {
    switch (currentStep) {
      case 'datetime':
        if (selectedDate && startTime && duration >= BookingHourDuration.MIN && duration <= BookingHourDuration.MAX) {
          fetchAvailableVehicles()
        } else {
          setError('Vui lòng chọn ngày, giờ và thời lượng phù hợp')
        }
        break
      case 'vehicle':
        if (selectedVehicles.length > 0) {
          setCurrentStep('location')
        } else {
          setError('Vui lòng chọn ít nhất một loại xe')
        }
        break
      case 'location':
        if (startPoint.address.trim()) {
          handleSubmitBooking()
        } else {
          setError('Vui lòng chọn địa điểm đón')
        }
        break
      default:
        break
    }
  }, [currentStep, selectedDate, startTime, duration, selectedVehicles, startPoint.address, fetchAvailableVehicles, handleSubmitBooking])

  const handleBackStep = useCallback(() => {
    switch (currentStep) {
      case 'vehicle':
        setCurrentStep('datetime')
        break
      case 'location':
        setCurrentStep('vehicle')
        break
      case 'checkout':
        setCurrentStep('location')
        break
      default:
        break
    }
  }, [currentStep])

  // Update booking state whenever dependencies change
  useEffect(() => {
    setBooking((prev) => ({
      ...prev,
      startPoint: startPoint,
      date: selectedDate?.format('YYYY-MM-DD') || '',
      startTime: startTime?.format('HH:mm') || '',
      durationMinutes: duration,
      vehicleCategories: selectedVehicles,
    }))
  }, [selectedDate, startTime, duration, selectedVehicles, startPoint])

  // Render the content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'datetime':
        return (
          <div className="space-y-6">
            <DateTimeSelection
              selectedDate={selectedDate}
              startTime={startTime}
              duration={duration}
              onDateChange={handleDateChange}
              onStartTimeChange={handleStartTimeChange}
              onDurationChange={handleDurationChange}
            />
            <div className="flex justify-end">
              <button
                onClick={handleNextStep}
                disabled={!selectedDate || !startTime || loading ||
                  duration < BookingHourDuration.MIN || duration > BookingHourDuration.MAX}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                aria-label="Chọn loại xe"
                tabIndex={0}
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
                aria-label="Quay lại chọn thời gian"
                tabIndex={0}
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={selectedVehicles.length === 0}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                aria-label="Chọn địa điểm"
                tabIndex={0}
              >
                Tiếp tục
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
                aria-label="Quay lại chọn xe"
                tabIndex={0}
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={!startPoint.address.trim() || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                aria-label="Xác nhận đặt xe"
                tabIndex={0}
              >
                {loading ? 'Đang xử lý...' : 'Tiếp tục'}
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
                aria-label="Quay lại trang chọn địa điểm"
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

  // Progress indicators for each step
  const getStepProgress = (step: 'datetime' | 'vehicle' | 'location' | 'checkout') => {
    const steps = ['datetime', 'vehicle', 'location', 'checkout']
    const currentIndex = steps.indexOf(currentStep)
    const stepIndex = steps.indexOf(step)

    if (stepIndex < currentIndex) return 100
    if (stepIndex === currentIndex) return 100
    return 0
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Title level={2} className="mb-6 text-center text-lg sm:mb-8 sm:text-xl md:text-2xl">
        Đặt xe theo giờ
      </Title>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div
            className={`flex-1 text-center ${currentStep === 'datetime' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('datetime') > 0 ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                style={{ width: `${getStepProgress('datetime')}%` }}
              />
            </div>
            <span>Chọn ngày & giờ</span>
          </div>
          <div
            className={`flex-1 text-center ${currentStep === 'vehicle' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('vehicle') > 0 ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                style={{ width: `${getStepProgress('vehicle')}%` }}
              />
            </div>
            <span>Chọn loại xe</span>
          </div>
          <div
            className={`flex-1 text-center ${currentStep === 'location' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('location') > 0 ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                style={{ width: `${getStepProgress('location')}%` }}
              />
            </div>
            <span>Chọn địa điểm</span>
          </div>
          <div
            className={`flex-1 text-center ${currentStep === 'checkout' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('checkout') > 0 ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
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

export default HourlyBookingPage
