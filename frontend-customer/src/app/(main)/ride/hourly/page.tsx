'use client'

import React, { useEffect, useState } from 'react'

import {
  CarOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Row, Steps, Typography, notification } from 'antd'
import Alert from 'antd/es/alert/Alert'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'

import { BookingHourDuration } from '@/constants/booking.constants'

import { AvailableVehicle, BookingHourRequest, BookingResponse } from '@/interface/booking'
import { bookingHour } from '@/service/booking.service'
import { vehicleSearchHour } from '@/service/search.service'

import CheckoutPage from '../../components/booking/bookingcomponents/checkoutpage'
import DateTimeSelection from '../../components/booking/bookingcomponents/datetimeselection'
import VehicleSelection from '../../components/booking/bookingcomponents/vehicleselection'

const LocationSelection = dynamic(
  () => import('../../components/booking/bookingcomponents/locationselection'),
  { ssr: false }
)

const { Step } = Steps
const { Title } = Typography

const steps = [
  { title: 'Chọn ngày & giờ', icon: <ClockCircleOutlined /> },
  { title: 'Chọn loại xe', icon: <CarOutlined /> },
  { title: 'Chọn địa điểm đón', icon: <EnvironmentOutlined /> },
  { title: 'Thanh toán', icon: <CreditCardOutlined /> },
]

const HourlyBookingPage = () => {
  const [current, setCurrent] = useState(0)
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null)
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null)
  const [duration, setDuration] = useState<number>(60)
  const [loading, setLoading] = useState(false)
  const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<BookingHourRequest['vehicleCategories']>(
    []
  )
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null)
  const [vehicleSearchError, setVehicleSearchError] = useState<string | null>(null)
  const [startPoint, setStartPoint] = useState<{
    position: { lat: number; lng: number }
    address: string
  }>({
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Chạy trên client!')
    }
  }, [])

  // Define detectUserLocation function
  const detectUserLocation = () => {
    if (typeof window === 'undefined') return
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        console.log('User location:', latitude, longitude)
      })
    } else {
      console.error('Geolocation is not supported by this browser.')
    }
  }

  const handleVehicleSelection = (categoryId: string, quantity: number) => {
    setSelectedVehicles((prev) => {
      const existing = prev.find((v) => v.categoryVehicleId === categoryId)
      if (existing) {
        if (quantity === 0) {
          return prev.filter((v) => v.categoryVehicleId !== categoryId)
        }
        return prev.map((v) => (v.categoryVehicleId === categoryId ? { ...v, quantity } : v))
      }
      return quantity > 0 ? [...prev, { categoryVehicleId: categoryId, quantity }] : prev
    })
  }

  const handleLocationChange = (newPosition: { lat: number; lng: number }, newAddress: string) => {
    setStartPoint({
      position: newPosition,
      address: newAddress,
    })
  }

  const canProceedToNextStep = () => {
    switch (current) {
      case 0:
        return (
          (!!selectedDate && !!startTime && duration >= BookingHourDuration.MIN) ||
          duration <= BookingHourDuration.MAX
        )
      case 1:
        return selectedVehicles.length > 0
      case 2:
        return !!startPoint.address.trim()
      default:
        return true
    }
  }

  // Thêm hàm fetch vehicles từ backend
  const fetchAvailableVehicles = async () => {
    try {
      console.log('fetchAvailableVehicles')
      setLoading(true)
      setVehicleSearchError(null) // Xóa lỗi trước khi gọi API

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
      return true
    } catch (error: unknown) {
      console.error('Lỗi khi tìm kiếm xe:', error)
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách xe.'
      setVehicleSearchError(errorMessage) // Lưu lỗi vào state
      setAvailableVehicles([])
      return false
    } finally {
      setLoading(false)
    }
  }

  // Sửa hàm next
  const next = async () => {
    if (!canProceedToNextStep()) {
      notification.warning({
        message: 'Vui lòng hoàn thành bước hiện tại',
        description:
          current === 1 ? 'Vui lòng chọn ít nhất một loại xe' : 'Vui lòng điền đầy đủ thông tin',
      })
      return
    }

    if (current === 0) {
      const success = await fetchAvailableVehicles()
      if (!success) return
    }
    // Handle submission when moving to checkout
    if (current === 2) {
      try {
        await handleSubmit()
      } catch {
        return // Prevent advancing on error
      }
    }
    setCurrent(current + 1)
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      console.log('response', booking)
      const response = await bookingHour(booking)
      console.log('response', response)
      setBookingResponse(response) // Store response
      console.log('response', response)
      return response // Return for next step
    } catch (error: unknown) {
      notification.error({
        message: 'Lỗi đặt xe',
        description: error instanceof Error ? error.message : 'Không thể đặt xe',
      })
      console.log('Error', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

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

  useEffect(() => {
    console.log(booking)
  }, [booking])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-[1200px] rounded-xl p-4 shadow-md sm:p-6 md:p-8">
        <Title level={2} className="mb-6 text-center text-lg sm:mb-8 sm:text-xl md:text-2xl">
          Đặt xe theo giờ
        </Title>

        <Steps current={current} className="mb-6 sm:mb-8" size="small" responsive>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>

        <Card className="p-3 sm:p-4 md:p-6">
          {current === 0 && (
            <>
              <DateTimeSelection
                selectedDate={selectedDate}
                startTime={startTime}
                duration={duration}
                onDateChange={setSelectedDate}
                onStartTimeChange={setStartTime}
                onDurationChange={setDuration}
              />
              {vehicleSearchError && (
                <div className="mt-3">
                  <Alert message="" description={vehicleSearchError} type="error" showIcon />
                </div>
              )}
            </>
          )}
          {current === 1 && (
            <VehicleSelection
              availableVehicles={availableVehicles}
              selectedVehicles={selectedVehicles}
              onSelectionChange={handleVehicleSelection}
            />
          )}
          {current === 2 && (
            <LocationSelection
              startPoint={startPoint}
              onLocationChange={handleLocationChange}
              loading={loading}
              detectUserLocation={detectUserLocation}
            />
          )}
          {current === 3 && bookingResponse && <CheckoutPage bookingResponse={bookingResponse} />}
        </Card>

        <Row justify="space-between" className="mt-6 sm:mt-8">
          <Col>
            {current > 0 && (
              <Button
                onClick={prev}
                size="large"
                className="h-auto px-4 text-sm sm:px-6 sm:text-base"
              >
                Quay lại
              </Button>
            )}
          </Col>
          <Col>
            {current < steps.length - 1 && (
              <Button
                type="primary"
                onClick={next}
                disabled={!canProceedToNextStep()}
                loading={(current === 0 || current === 2) && loading}
                size="large"
                className="h-auto px-4 text-sm sm:px-6 sm:text-base"
              >
                Tiếp theo
              </Button>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default HourlyBookingPage
