'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Alert, Card, Radio, Space, Steps, Typography, notification } from 'antd'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'

import { BookingHourDuration } from '@/constants/booking.constants'
import { PaymentMethod } from '@/constants/payment.enum'

import CheckoutPage from '@/views/Ride/components/checkoutpage'
import DateTimeSelection from '@/views/Ride/components/datetimeselection'
import VehicleSelection from '@/views/Ride/components/vehicleselection'

import {
  AvailableVehicle,
  BookingHourRequest,
  BookingResponse,
} from '@/interface/booking.interface'
import { bookingHour } from '@/service/booking.service'
import { cancelBooking } from '@/service/booking.service'
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
  const steps = ['datetime', 'vehicle', 'location', 'payment', 'confirmation', 'checkout']
  // Define steps for the booking flow
  const [currentStep, setCurrentStep] = useState<
    'datetime' | 'vehicle' | 'location' | 'payment' | 'confirmation' | 'checkout'
  >('datetime')
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null)
  const [duration, setDuration] = useState<number>(60)
  const [loading, setLoading] = useState(false)
  const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<BookingHourRequest['vehicleCategories']>(
    []
  )
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [startPoint, setStartPoint] = useState<LocationPoint>({
    position: { lat: 10.840405, lng: 106.843424 },
    address: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PAY_OS)
  const [startTimeIsNow, setStartTimeIsNow] = useState(false)
  const [booking, setBooking] = useState<BookingHourRequest>({
    startPoint: { position: { lat: 0, lng: 0 }, address: '' },
    date: '',
    startTime: '',
    durationMinutes: 0,
    vehicleCategories: [],
    paymentMethod: paymentMethod,
  })

  // Add state to track location errors
  const [locationHasError, setLocationHasError] = useState(false)

  // Handle date and time selection
  const handleDateChange = useCallback((date: dayjs.Dayjs | null) => {
    setSelectedDate(date)
    console.log('Index: Date selected:', date ? date.format('YYYY-MM-DD') : 'null')
  }, [])

  const handleStartTimeChange = useCallback((time: dayjs.Dayjs | null) => {
    setStartTime(time)
    console.log('Index: Time selected:', time ? time.format('HH:mm') : 'null')
  }, [])

  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration)
    console.log('Index: Duration selected:', newDuration)
  }, [])

  // Vehicle selection handler
  const handleVehicleSelection = useCallback(
    (categoryId: string, quantity: number) => {
      setSelectedVehicles((prev) => {
        const existing = prev.find((v) => v.categoryVehicleId === categoryId)
        if (existing) {
          if (quantity === 0) {
            return prev.filter((v) => v.categoryVehicleId !== categoryId)
          }
          return prev.map((v) => (v.categoryVehicleId === categoryId ? { ...v, quantity } : v))
        }
        // Find the vehicle category name from availableVehicles
        const vehicleCategory = availableVehicles.find(
          (v) => v.vehicleCategory._id === categoryId
        )?.vehicleCategory
        return quantity > 0
          ? [
            ...prev,
            {
              categoryVehicleId: categoryId,
              quantity,
              name: vehicleCategory?.name || '',
            },
          ]
          : prev
      })
    },
    [availableVehicles]
  )

  const handlePaymentMethodChange = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method)
  }, [])

  // Location handlers
  const handleLocationChange = useCallback(
    (newPosition: { lat: number; lng: number }, newAddress: string, hasError?: boolean) => {
      setStartPoint({
        position: newPosition,
        address: newAddress,
      })

      // Track if there's a location error
      setLocationHasError(hasError || false)
    },
    []
  )

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
          maximumAge: 0,
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

      console.log('Searching for vehicles with date/time:', {
        date,
        startTime: startTimeString,
        duration,
      })

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
      console.log('Booking data being submitted:', booking)
      const startTimeBooking = startTimeIsNow ? dayjs().add(5, 'minute') : startTime
      const newBooking: BookingHourRequest = {
        ...booking,
        startTime: startTimeBooking?.format('HH:mm') || '',
      }
      const response = await bookingHour(newBooking)
      console.log('Booking response received:', response)
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
        if (
          selectedDate &&
          startTime &&
          duration >= BookingHourDuration.MIN &&
          duration <= BookingHourDuration.MAX
        ) {
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
          setCurrentStep('payment')
        } else {
          setError('Vui lòng chọn địa điểm đón')
        }
        break
      case 'payment':
        setCurrentStep('confirmation')
        break
      case 'confirmation':
        handleSubmitBooking()
        break
      default:
        break
    }
  }, [
    currentStep,
    selectedDate,
    startTime,
    duration,
    selectedVehicles,
    startPoint.address,
    fetchAvailableVehicles,
    handleSubmitBooking,
  ])

  const handleBackStep = useCallback(() => {
    switch (currentStep) {
      case 'vehicle':
        setCurrentStep('datetime')
        break
      case 'location':
        setCurrentStep('vehicle')
        break
      case 'payment':
        setCurrentStep('location')
        break
      case 'confirmation':
        setCurrentStep('payment')
        break
      case 'checkout':
        if (bookingResponse && bookingResponse.newBooking._id) {
          // Cancel the booking when returning from checkout
          setLoading(true)
          cancelBooking(bookingResponse.newBooking._id)
            .then(() => {
              notification.success({
                message: 'Hủy đặt xe thành công',
                description: 'Đơn đặt xe của bạn đã được hủy thành công.',
              })
              setBookingResponse(null)
              setCurrentStep('confirmation')
            })
            .catch((error) => {
              notification.error({
                message: 'Lỗi khi hủy đặt xe',
                description: error.message || 'Không thể hủy đơn đặt xe. Vui lòng thử lại sau.',
              })
            })
            .finally(() => {
              setLoading(false)
            })
        } else {
          setCurrentStep('confirmation')
        }
        break
      default:
        break
    }
  }, [currentStep, bookingResponse])

  // Update booking state whenever dependencies change
  useEffect(() => {
    const startTimeTrip = startTimeIsNow ? dayjs().add(5, 'minute') : startTime
    const updatedBooking = {
      startPoint: startPoint,
      date: selectedDate?.format('YYYY-MM-DD') || '',
      startTime: startTimeTrip?.format('HH:mm') || '',
      durationMinutes: duration,
      vehicleCategories: selectedVehicles,
      paymentMethod: paymentMethod,
    }

    setBooking(updatedBooking)
    console.log('Booking updated:', updatedBooking)
  }, [selectedDate, startTime, duration, selectedVehicles, startPoint, paymentMethod])

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
              setStartTimeIsNow={setStartTimeIsNow}
            />
            <div className="flex justify-end">
              <button
                onClick={handleNextStep}
                disabled={
                  !selectedDate ||
                  !startTime ||
                  loading ||
                  duration < BookingHourDuration.MIN ||
                  duration > BookingHourDuration.MAX
                }
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
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
                className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
                aria-label="Quay lại chọn thời gian"
                tabIndex={0}
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={selectedVehicles.length === 0}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
                aria-label="Chọn địa điểm"
                tabIndex={0}
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
                className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
                aria-label="Quay lại chọn xe"
                tabIndex={0}
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={!startPoint.address.trim() || loading || locationHasError}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
                aria-label="Chọn phương thức thanh toán"
                tabIndex={0}
              >
                {loading ? 'Đang xử lý...' : 'Tiếp tục'}
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
              </Space>
            </Radio.Group>

            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBackStep}
                className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
                aria-label="Quay lại chọn địa điểm"
                tabIndex={0}
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
                aria-label="Xác nhận thông tin"
                tabIndex={0}
              >
                Tiếp tục
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Thời gian</h3>
                    <p className="text-gray-600">
                      {selectedDate?.format('DD/MM/YYYY')} - {startTime?.format('HH:mm')} (
                      {duration} phút)
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Loại xe</h3>
                    <div className="text-gray-600">
                      {selectedVehicles.map((vehicle, index) => (
                        <p key={index}>
                          {vehicle.name} - Số lượng: {vehicle.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Địa điểm đón</h3>
                    <p className="text-gray-600">{startPoint.address}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Phương thức thanh toán</h3>
                    <p className="text-gray-600">
                      {paymentMethod === PaymentMethod.PAY_OS
                        ? 'Thanh toán qua PayOS'
                        : 'Ví điện tử Momo'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBackStep}
                className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
                aria-label="Quay lại chọn phương thức thanh toán"
                tabIndex={0}
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
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
                disabled={loading}
                className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600 disabled:bg-gray-300"
                aria-label="Quay lại trang xác nhận"
                tabIndex={0}
              >
                {loading ? 'Đang hủy đặt xe...' : 'Quay lại'}
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
        Đặt xe theo giờ
      </Title>

      <div className="mb-8">
        <Steps
          current={steps.indexOf(currentStep)}
          items={[
            { title: 'Chọn thời gian' },
            { title: 'Chọn xe' },
            { title: 'Địa điểm' },
            { title: 'Thanh toán' },
            { title: 'Xác nhận' },
            { title: 'Hoàn tất' },
          ]}
          responsive
          direction="horizontal"
          className="custom-steps [&_.ant-steps-item-finish_.ant-steps-item-icon]:!bg-blue-500 [&_.ant-steps-item-finish_.ant-steps-item-icon]:!text-white [&_.ant-steps-item-finish_.ant-steps-item-tail::after]:!bg-blue-500 [&_.ant-steps-item-icon]:!flex [&_.ant-steps-item-icon]:!h-7 [&_.ant-steps-item-icon]:!w-7 [&_.ant-steps-item-icon]:!items-center [&_.ant-steps-item-icon]:!justify-center [&_.ant-steps-item-icon]:!border-[1.5px] [&_.ant-steps-item-icon]:!border-blue-500 [&_.ant-steps-item-icon]:!bg-white [&_.ant-steps-item-icon]:!text-blue-500 sm:[&_.ant-steps-item-icon]:!h-8 sm:[&_.ant-steps-item-icon]:!w-8 [&_.ant-steps-item-process_.ant-steps-item-icon]:!bg-blue-500 [&_.ant-steps-item-process_.ant-steps-item-icon]:!text-white [&_.ant-steps-item-tail::after]:!h-[1.5px] [&_.ant-steps-item-tail::after]:!bg-gray-200 [&_.ant-steps-item-tail]:!top-3.5 sm:[&_.ant-steps-item-tail]:!top-4 [&_.ant-steps-item-title]:!text-xs [&_.ant-steps-item-title]:!font-medium sm:[&_.ant-steps-item-title]:!text-sm [&_.ant-steps-item]:!px-0 sm:[&_.ant-steps-item]:!px-2"
        />
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

export default HourlyBookingPage
