'use client'

import React, { useCallback, useState } from 'react'

import { Radio, Space, Steps, Typography, notification } from 'antd'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'

import { PaymentMethod } from '@/constants/payment.enum'

import {
  AvailableVehicle,
  BookingHourRequest,
  BookingResponse,
} from '@/interface/booking.interface'
import { bookingRoute, cancelBooking } from '@/service/booking.service'
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
  const [currentStep, setCurrentStep] = useState<
    'datetime' | 'route' | 'vehicle' | 'location' | 'payment' | 'confirmation' | 'checkout'
  >('datetime')

  // State for date and time selection
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null)

  // State for vehicle selection
  const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<BookingHourRequest['vehicleCategories']>(
    []
  )

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PAY_OS)
  const [locationHasError, setLocationHasError] = useState(false)
  const handlePaymentMethodChange = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method)
  }, [])
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

  // Handler for location selection
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

  // Handler for vehicle selection
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
    },
    [availableVehicles]
  )

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
        const errorMsg = 'Trình duyệt của bạn không hỗ trợ định vị'
        setError(errorMsg)
        notification.error({
          message: 'Không hỗ trợ định vị',
          description: errorMsg,
          placement: 'topRight',
          duration: 4
        })
        throw new Error(errorMsg)
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

      notification.success({
        message: 'Đã xác định vị trí',
        description: 'Đã xác định được vị trí hiện tại của bạn',
        placement: 'topRight',
        duration: 3
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
      notification.error({
        message: 'Lỗi xác định vị trí',
        description: errorMessage,
        placement: 'topRight',
        duration: 4
      })
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
      const errorMessage = error instanceof Error
        ? error.message
        : 'Không thể tìm thấy phương tiện phù hợp'

      setError(errorMessage)
      notification.error({
        message: 'Lỗi tìm kiếm phương tiện',
        description: errorMessage,
        placement: 'topRight',
        duration: 4
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [selectedDate, startTime, selectedRoute])

  // Function to handle final booking submission
  const handleConfirmBooking = useCallback(async () => {
    if (
      !selectedDate ||
      !startTime ||
      !selectedRoute ||
      !startPoint.address ||
      selectedVehicles.length === 0
    ) {
      setError('Vui lòng điền đầy đủ thông tin đặt xe')
      notification.warning({
        message: 'Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ thông tin đặt xe',
        placement: 'topRight',
        duration: 4
      })
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
        paymentMethod: paymentMethod,
      })

      console.log('Booking response:', response)
      setBookingResponse(response)
      setCurrentStep('checkout')

      notification.success({
        message: 'Đặt xe thành công',
        description: 'Đơn đặt xe của bạn đã được ghi nhận. Vui lòng thanh toán để hoàn tất.',
        placement: 'topRight',
        duration: 4
      })
    } catch (error) {
      console.error('Error booking route:', error)
      const errorMessage = error instanceof Error
        ? error.message
        : 'Có lỗi xảy ra khi đặt xe. Vui lòng thử lại.'

      setError(errorMessage)
      notification.error({
        message: 'Lỗi đặt xe',
        description: errorMessage,
        placement: 'topRight',
        duration: 4
      })
    } finally {
      setLoading(false)
    }
  }, [selectedDate, startTime, selectedRoute, startPoint, selectedVehicles, paymentMethod])

  // Handler for navigating to the next step
  const handleNextStep = useCallback(() => {
    if (currentStep === 'datetime') {
      if (!selectedDate || !startTime) {
        setError('Vui lòng chọn ngày và giờ')
        notification.warning({
          message: 'Thiếu thông tin',
          description: 'Vui lòng chọn ngày và giờ',
          placement: 'topRight',
          duration: 3
        })
        return
      }
      setError(null)
      setCurrentStep('route')
    } else if (currentStep === 'route') {
      if (!selectedRoute) {
        setError('Vui lòng chọn lộ trình')
        notification.warning({
          message: 'Thiếu thông tin',
          description: 'Vui lòng chọn lộ trình',
          placement: 'topRight',
          duration: 3
        })
        return
      }
      setError(null)
      fetchAvailableVehicles()
    } else if (currentStep === 'vehicle') {
      if (selectedVehicles.length === 0) {
        setError('Vui lòng chọn loại xe')
        notification.warning({
          message: 'Thiếu thông tin',
          description: 'Vui lòng chọn loại xe',
          placement: 'topRight',
          duration: 3
        })
        return
      }
      setError(null)
      setCurrentStep('location')
    } else if (currentStep === 'location') {
      if (!startPoint.address) {
        setError('Vui lòng chọn địa điểm đón')
        notification.warning({
          message: 'Thiếu thông tin',
          description: 'Vui lòng chọn địa điểm đón',
          placement: 'topRight',
          duration: 3
        })
        return
      }
      if (locationHasError) {
        setError('Địa điểm đón không hợp lệ')
        notification.warning({
          message: 'Địa điểm không hợp lệ',
          description: 'Vui lòng chọn địa điểm đón hợp lệ',
          placement: 'topRight',
          duration: 3
        })
        return
      }
      setError(null)
      setCurrentStep('payment')
    } else if (currentStep === 'payment') {
      setError(null)
      setCurrentStep('confirmation')
    } else if (currentStep === 'confirmation') {
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
    locationHasError,
    fetchAvailableVehicles,
    handleConfirmBooking,
  ])

  // Handler for navigating to the previous step
  const handleBackStep = useCallback(() => {
    if (currentStep === 'route') {
      setCurrentStep('datetime')
    } else if (currentStep === 'vehicle') {
      setCurrentStep('route')
    } else if (currentStep === 'location') {
      setCurrentStep('vehicle')
    } else if (currentStep === 'payment') {
      setCurrentStep('location')
    } else if (currentStep === 'confirmation') {
      setCurrentStep('payment')
    } else if (currentStep === 'checkout') {
      if (bookingResponse && bookingResponse.newBooking._id) {
        // Cancel the booking when returning from checkout
        setLoading(true)
        notification.info({
          message: 'Đang hủy đặt xe',
          description: 'Đang tiến hành hủy đơn đặt xe của bạn...',
          placement: 'topRight',
          duration: 2
        })
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
    }
  }, [currentStep, bookingResponse])

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
            />
            <div className="flex justify-end">
              <button
                onClick={handleNextStep}
                disabled={!selectedDate || !startTime || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
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
                className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={!selectedRoute || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
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
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={selectedVehicles.length === 0 || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
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
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={
                  selectedVehicles.length === 0 ||
                  loading ||
                  locationHasError ||
                  !startPoint.address
                }
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
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
                      {selectedDate?.format('DD/MM/YYYY')} - {startTime?.format('HH:mm')}
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
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Lộ trình</h3>
                    <p className="text-gray-600">{selectedRoute?.name || 'Chưa chọn lộ trình'}</p>
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
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
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
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500">
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
                aria-label="Quay lại chọn phương thức thanh toán"
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

  const items = [
    {
      title: 'Thời gian',
      description: 'Chọn thời gian',
    },
    {
      title: 'Lộ trình',
      description: 'Chọn lộ trình',
    },
    {
      title: 'Xe',
      description: 'Chọn xe',
    },
    {
      title: 'Địa điểm',
      description: 'Chọn địa điểm',
    },
    {
      title: 'Thanh toán',
      description: 'Phương thức',
    },
    {
      title: 'Xác nhận',
      description: 'Xác nhận',
    },
    {
      title: 'Hoàn tất',
      description: 'Thanh toán',
    },
  ]

  const getCurrentStep = () => {
    const steps = [
      'datetime',
      'route',
      'vehicle',
      'location',
      'payment',
      'confirmation',
      'checkout',
    ]
    return steps.indexOf(currentStep)
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Title level={2} className="mb-6 text-center text-lg sm:mb-8 sm:text-xl md:text-2xl">
        Đặt xe lộ trình tham quan
      </Title>

      <div className="mb-8">
        <Steps
          current={getCurrentStep()}
          items={items}
          size="small"
          className="custom-steps"
          responsive={true}
          labelPlacement="vertical"
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

export default RoutesBooking
