'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Radio, Space, Typography, message } from 'antd'

import dynamic from 'next/dynamic'

import { PaymentMethod } from '@/constants/payment.enum'

import CheckoutPage from '@/views/Ride/components/checkoutpage'
import SharedLocation from '@/views/Ride/components/sharedLocation'

import {
  AvailableVehicle,
  BookingDestinationRequest,
  BookingResponse,
} from '@/interface/booking.interface'
import { bookingDestination } from '@/service/booking.service'
import { vehicleSearchDestination } from '@/service/search.service'

// Dynamic import components outside the component to prevent reloading
const { Title } = Typography
const VehicleSelection = dynamic(() => import('@/views/Ride/components/vehicleselection'), {
  ssr: false,
})
//yessir

const DestinationBookingPage = () => {
  const [currentStep, setCurrentStep] = useState<'location' | 'vehicle' | 'payment' | 'confirmation' | 'checkout'>(
    'location'
  )
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
  const [bookingPayload, setBookingPayload] = useState<BookingDestinationRequest | null>(null)

  // Check if code is running in browser
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  const handlePaymentMethodChange = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method)
  }, [])

  const handleStartLocationChange = useCallback(
    (newPosition: { lat: number; lng: number }, newAddress: string) => {
      setStartPoint({
        position: newPosition,
        address: newAddress,
      })
    },
    []
  )

  const handleEndLocationChange = useCallback(
    (newPosition: { lat: number; lng: number }, newAddress: string) => {
      setEndPoint({
        position: newPosition,
        address: newAddress,
      })
    },
    []
  )
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

  const handleVehicleSelection = useCallback(
    (categoryId: string, quantity: number) => {
      setSelectedVehicles((prev) => {
        const existing = prev.find((v) => v.categoryVehicleId === categoryId)
        const vehicleCategory = availableVehicles.find((v) => v.vehicleCategory._id === categoryId)
        const name = vehicleCategory ? vehicleCategory.vehicleCategory.name : ''

        if (existing) {
          if (quantity === 0) {
            return prev.filter((v) => v.categoryVehicleId !== categoryId)
          }
          return prev.map((v) => (v.categoryVehicleId === categoryId ? { ...v, quantity } : v))
        }
        return quantity > 0 ? [...prev, { categoryVehicleId: categoryId, quantity, name }] : prev
      })
    },
    [availableVehicles]
  )

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

  const prepareBookingPayload = useCallback(() => {
    if (selectedVehicles.length === 0) {
      setError('Vui lòng chọn loại xe')
      return null
    }

    // Prepare the payload for booking destination
    const payload: BookingDestinationRequest = {
      startPoint: startPoint,
      endPoint: endPoint,
      durationEstimate: durationEstimate,
      distanceEstimate: estimatedDistance,
      vehicleCategories: {
        categoryVehicleId: selectedVehicles[0].categoryVehicleId,
        name: selectedVehicles[0].name,
      },
      paymentMethod: paymentMethod,
    }

    setBookingPayload(payload)
    return payload
  }, [selectedVehicles, startPoint, endPoint, durationEstimate, estimatedDistance, paymentMethod])

  const handleConfirmBooking = useCallback(async () => {
    const payload = prepareBookingPayload()
    if (!payload) return

    setLoading(true)
    setError(null)

    try {
      console.log('Calling bookingDestination with payload:', payload)

      const response = await bookingDestination(payload)
      console.log('bookingDestination response:', response)
      if (response.newBooking.paymentMethod === PaymentMethod.CASH) {
        //redirect to trips page
        message.success('Đặt xe thành công!')
        window.location.href = '/trips'
        return
      }
      setBookingResponse(response)
      setCurrentStep('checkout')
    } catch (error) {
      console.error('Error creating booking:', error)
      setError(error instanceof Error ? error.message : 'Không thể đặt xe')
    } finally {
      setLoading(false)
    }
  }, [prepareBookingPayload])

  const handleNextStep = useCallback(() => {
    if (currentStep === 'location' && startPoint.address && endPoint.address) {
      fetchAvailableVehicles()
    } else if (currentStep === 'vehicle' && selectedVehicles.length > 0) {
      setCurrentStep('payment')
    } else if (currentStep === 'payment') {
      const payload = prepareBookingPayload()
      if (payload) {
        setCurrentStep('confirmation')
      }
    } else if (currentStep === 'confirmation') {
      handleConfirmBooking()
    } else if (currentStep === 'checkout') {
      handleConfirmBooking()
    }
  }, [
    currentStep,
    startPoint.address,
    endPoint.address,
    selectedVehicles.length,
    fetchAvailableVehicles,
    prepareBookingPayload,
    handleConfirmBooking,
  ])

  const handleBackStep = useCallback(() => {
    if (currentStep === 'vehicle') {
      setCurrentStep('location')
    } else if (currentStep === 'payment') {
      setCurrentStep('vehicle')
    } else if (currentStep === 'confirmation') {
      setCurrentStep('payment')
    } else if (currentStep === 'checkout') {
      setCurrentStep('confirmation')
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
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
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
                className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
                aria-label="Quay lại trang chọn địa điểm"
                tabIndex={0}
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={selectedVehicles.length === 0 || loading}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
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
              onChange={(e) => handlePaymentMethodChange(e.target.value as PaymentMethod)}
              value={paymentMethod}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                <Radio value={PaymentMethod.PAY_OS} className="w-full rounded-lg border p-4">
                  <div className="flex items-center">
                    <img src="/images/payos-logo.png" alt="PayOS" className="mr-3 h-8" />
                    <span>Thanh toán qua PayOS</span>
                  </div>
                </Radio>
                <Radio value={PaymentMethod.MOMO} className="w-full rounded-lg border p-4">
                  <div className="flex items-center">
                    <img src="/images/momo-logo.png" alt="Momo" className="mr-3 h-8" />
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
                aria-label="Xác nhận thanh toán"
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
                <div className="flex items-start">
                  <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Điểm đón</h3>
                    <p className="text-gray-600">{startPoint.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Điểm đến</h3>
                    <p className="text-gray-600">{endPoint.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Loại xe</h3>
                    <p className="text-gray-600">
                      {selectedVehicles.map(vehicle => `${vehicle.name} (${vehicle.quantity})`).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phương thức thanh toán</h3>
                    <p className="text-gray-600">
                      {paymentMethod === PaymentMethod.PAY_OS
                        ? 'Thanh toán qua PayOS'
                        : paymentMethod === PaymentMethod.MOMO
                          ? 'Ví điện tử Momo'
                          : 'Tiền mặt'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Thời gian dự kiến</h3>
                    <p className="text-gray-600">{durationEstimate} phút</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Khoảng cách</h3>
                    <p className="text-gray-600">{estimatedDistance} km</p>
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
                className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
                aria-label="Xác nhận đặt xe"
                tabIndex={0}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
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

  const getStepProgress = (step: 'location' | 'vehicle' | 'payment' | 'confirmation' | 'checkout') => {
    const steps = ['location', 'vehicle', 'payment', 'confirmation', 'checkout']
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
          <div
            className={`flex-1 text-center ${getStepProgress('location') > 0 ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('location') > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: `${getStepProgress('location')}%` }}
              />
            </div>
            <span className="hidden sm:inline">Chọn địa điểm</span>
          </div>

          <div
            className={`flex-1 text-center ${getStepProgress('vehicle') > 0 ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('vehicle') > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: `${getStepProgress('vehicle')}%` }}
              />
            </div>
            <span className="hidden sm:inline">Chọn xe</span>
          </div>

          <div
            className={`flex-1 text-center ${getStepProgress('payment') > 0 ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('payment') > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: `${getStepProgress('payment')}%` }}
              />
            </div>
            <span className="hidden sm:inline">Phương thức thanh toán</span>
          </div>

          <div
            className={`flex-1 text-center ${getStepProgress('confirmation') > 0 ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('confirmation') > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: `${getStepProgress('confirmation')}%` }}
              />
            </div>
            <span className="hidden sm:inline">Xác nhận</span>
          </div>

          <div
            className={`flex-1 text-center ${getStepProgress('checkout') > 0 ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStepProgress('checkout') > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: `${getStepProgress('checkout')}%` }}
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

export default DestinationBookingPage
