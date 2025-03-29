'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'

import dynamic from 'next/dynamic'
import { FaCar, FaClock, FaCreditCard, FaMapMarkerAlt } from 'react-icons/fa'

import CheckoutPage from '@/views/Ride/components/checkoutpage'
import TripTypeSelection from '@/views/Ride/components/triptypeselection'
import SharedLocation from '@/views/Ride/components/sharedLocation'

import { AvailableVehicle, BookingDestinationRequest, BookingResponse } from '@/interface/booking.interface'
import { bookingDestination } from '@/service/booking.service'
import { vehicleSearchDestination } from '@/service/search.service'

const steps = [
  { title: 'Chọn số người', icon: <FaClock className="text-blue-500" /> },
  { title: 'Chọn điểm đi & đến', icon: <FaMapMarkerAlt className="text-blue-500" /> },
  { title: 'Chọn xe', icon: <FaCar className="text-blue-500" /> },
  { title: 'Thanh toán', icon: <FaCreditCard className="text-blue-500" /> },
]

// Dynamic import components outside the component to prevent reloading
const VehicleSelection = dynamic(() => import('@/views/Ride/components/vehicleselection'), {
  ssr: false,
})

const DestinationBookingPage = () => {
  const [tripType, setTripType] = useState<'alone' | 'shared'>('alone')
  const [passengerCount, setPassengerCount] = useState(1)
  const [current, setCurrent] = useState(0)
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
  const [pickup, setPickup] = useState<string>('')
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
  const [estimatedDistance, setEstimatedDistance] = useState<number>(2)
  const [estimatedDuration, setEstimatedDuration] = useState<number>(5)

  // Check if code is running in browser
  useEffect(() => {
    setIsBrowser(true)
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

  const calculateDistance = useCallback(() => {
    // Calculate distance in km between two points using Haversine formula
    const R = 6371 // Radius of the Earth in km
    const dLat = ((endPoint.position.lat - startPoint.position.lat) * Math.PI) / 180
    const dLon = ((endPoint.position.lng - startPoint.position.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((startPoint.position.lat * Math.PI) / 180) *
      Math.cos((endPoint.position.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    // Calculate estimated duration (rough estimate: 1 km = 2 minutes)
    const duration = Math.ceil(distance * 2)

    setEstimatedDistance(parseFloat(distance.toFixed(2)) || 2)
    setEstimatedDuration(duration || 5)

    return { distance, duration }
  }, [startPoint.position.lat, startPoint.position.lng, endPoint.position.lat, endPoint.position.lng])

  const next = useCallback(() => setCurrent(current + 1), [current])
  const prev = useCallback(() => setCurrent(current - 1), [current])

  const detectUserLocation = useCallback(async () => {
    if (!isBrowser) return // Only run in browser

    setLoading(true)
    try {
      if (!navigator.geolocation) {
        alert('Trình duyệt không hỗ trợ định vị')
        return
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          )

          const data = await response.json()
          setPickup(data.display_name)
        },
        () => alert('Không thể xác định vị trí của bạn')
      )
    } finally {
      setLoading(false)
    }
  }, [isBrowser])

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

  const canProceedToNextStep = useCallback(() => {
    switch (current) {
      case 0:
        return passengerCount > 0
      case 1:
        return !!startPoint.address.trim() && !!endPoint.address.trim()
      case 2:
        return selectedVehicles.length > 0
      case 3:
        return true
      default:
        return true
    }
  }, [current, passengerCount, startPoint.address, endPoint.address, selectedVehicles.length])

  const fetchAvailableVehicles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Use calculateDistance to update estimatedDistance and estimatedDuration
      calculateDistance()

      if (!startPoint.address || !endPoint.address) {
        setError('Vui lòng chọn địa điểm đón và trả khách')
        setLoading(false)
        return false
      }

      console.log('Calling vehicleSearchDestination with params:', {
        estimatedDuration: estimatedDuration || 5,
        estimatedDistance: estimatedDistance || 2,
        endPoint: endPoint.position,
        startPoint: startPoint.position,
      })

      // Call API to get available vehicles using vehicleSearchDestination
      const vehicles = await vehicleSearchDestination(
        estimatedDuration || 5, // Use default value if not available
        estimatedDistance || 2, // Use default value if not available
        endPoint.position,
        startPoint.position
      )

      console.log('vehicleSearchDestination response:', vehicles)
      setAvailableVehicles(Array.isArray(vehicles) ? vehicles : [vehicles])
      next()
      return true
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setError(error instanceof Error ? error.message : 'Không thể tìm thấy phương tiện phù hợp')
      return false
    } finally {
      setLoading(false)
    }
  }, [startPoint, endPoint, estimatedDuration, estimatedDistance, calculateDistance, next])

  const handleFinish = useCallback(async () => {
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
        estimatedDuration: estimatedDuration,
        distanceEstimate: estimatedDistance,
        vehicleCategories: {
          categoryVehicleId: selectedVehicles[0].categoryVehicleId,
          name: selectedVehicles[0].name
        },
        paymentMethod: 'pay_os',
      }

      console.log('Calling bookingDestination with payload:', payload)

      const response = await bookingDestination(payload)
      console.log('bookingDestination response:', response)

      setBookingResponse(response)
      next() // Move to checkout page
    } catch (error) {
      console.error('Error creating booking:', error)
      setError(error instanceof Error ? error.message : 'Không thể đặt xe')
    } finally {
      setLoading(false)
    }
  }, [selectedVehicles, startPoint, endPoint, estimatedDuration, estimatedDistance, next])

  // Memoize components to prevent unnecessary re-renders
  const currentStepContent = useMemo(() => {
    switch (current) {
      case 0:
        return (
          <TripTypeSelection
            tripType={tripType}
            onTripTypeChange={setTripType}
            passengerCount={passengerCount}
            onPassengerCountChange={setPassengerCount}
          />
        )
      case 1:
        return isBrowser ? (
          <SharedLocation
            startPoint={startPoint}
            endPoint={endPoint}
            onStartLocationChange={handleStartLocationChange}
            onEndLocationChange={handleEndLocationChange}
            loading={loading}
            detectUserLocation={detectUserLocation}
            numberOfSeats={passengerCount}
            onNumberOfSeatsChange={setPassengerCount}
          />
        ) : null
      case 2:
        return isBrowser ? (
          <VehicleSelection
            availableVehicles={availableVehicles}
            selectedVehicles={selectedVehicles}
            onSelectionChange={handleVehicleSelection}
          />
        ) : null
      case 3:
        return bookingResponse ? <CheckoutPage bookingResponse={bookingResponse} /> : null
      default:
        return null
    }
  }, [
    current,
    isBrowser,
    tripType,
    passengerCount,
    startPoint,
    endPoint,
    loading,
    availableVehicles,
    selectedVehicles,
    bookingResponse,
    handleStartLocationChange,
    handleEndLocationChange,
    detectUserLocation,
    handleVehicleSelection
  ])

  const navigationButtons = useMemo(() => (
    <div className="mt-8 flex justify-between">
      {current > 0 && current < 4 && (
        <button
          onClick={prev}
          className="rounded bg-gray-400 px-6 py-2 text-white"
        >
          Quay lại
        </button>
      )}
      <div>
        {current < steps.length - 1 && (
          <button
            onClick={() => {
              if (current === 1) {
                fetchAvailableVehicles();
              } else if (current === 2) {
                handleFinish()
              } else {
                next()
              }
            }}
            className="ml-2 rounded bg-blue-500 px-6 py-2 text-white"
            disabled={loading || !canProceedToNextStep()}
          >
            {loading
              ? 'Đang xử lý...'
              : current === 1
                ? 'Tìm xe'
                : current === 2
                  ? 'Xác nhận đặt xe'
                  : 'Tiếp theo'}
          </button>
        )}
      </div>
    </div>
  ), [current, loading, canProceedToNextStep, prev, next, fetchAvailableVehicles, handleFinish])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-5xl rounded-lg bg-white p-10 shadow-lg">
        <div className="mb-10 flex justify-between">
          {steps.map((item, index) => (
            <div
              key={item.title}
              className={`flex flex-col items-center ${index === current ? 'text-blue-500' : 'text-gray-400'}`}
            >
              {item.icon}
              <span className="mt-2 text-sm">{item.title}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div>
          {currentStepContent}
        </div>

        {navigationButtons}
      </div>
    </div>
  )
}

export default DestinationBookingPage
