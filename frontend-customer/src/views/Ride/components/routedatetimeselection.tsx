import { useEffect, useState } from 'react'

import { CalendarOutlined, ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Card, DatePicker, Switch, TimePicker } from 'antd'
import locale from 'antd/es/date-picker/locale/vi_VN'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

import { BOOKING_BUFFER_MINUTES, SystemOperatingHours } from '@/constants/booking.constants'

interface DateTimeSelectionProps {
  selectedDate: dayjs.Dayjs | null
  startTime: dayjs.Dayjs | null
  onDateChange: (date: dayjs.Dayjs | null) => void
  onStartTimeChange: (time: dayjs.Dayjs | null) => void
}

const RouteDateTimeSelection = ({
  selectedDate,
  startTime,
  onDateChange,
  onStartTimeChange,
}: DateTimeSelectionProps) => {
  const [pickupNow, setPickupNow] = useState(false)

  // Set current date and time with buffer when "pickup now" is selected
  useEffect(() => {
    if (pickupNow) {
      const now = dayjs()
      const currentHour = now.hour()

      // Check if current time is within system operating hours
      if (currentHour < SystemOperatingHours.START) {
        // If current time is before operating hours, set to system start time
        const systemStartTime = now.hour(SystemOperatingHours.START).minute(0).second(0)
        onDateChange(now)
        onStartTimeChange(systemStartTime)
      } else if (currentHour >= SystemOperatingHours.END) {
        // If current time is after operating hours, set to next day's start time
        const nextDay = now.add(1, 'day').hour(SystemOperatingHours.START).minute(0).second(0)
        onDateChange(nextDay)
        onStartTimeChange(nextDay)
      } else {
        // Normal case: add buffer to current time
        const bufferedTime = now.add(BOOKING_BUFFER_MINUTES, 'minute')
        onDateChange(now)
        onStartTimeChange(bufferedTime)
      }
    }
  }, [pickupNow, onDateChange, onStartTimeChange])

  // Disallow past dates
  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current < dayjs().startOf('day')
  }

  // Disallow times less than 2 minutes from current time
  const disabledTime = () => {
    const now = dayjs()
    const currentHour = now.hour()
    const currentMinute = now.minute()

    // Luôn áp dụng khung giờ hệ thống (7h-23h) khi chưa chọn ngày hoặc chọn ngày không phải hôm nay
    const defaultDisabledHours = () => {
      const hours = []
      // Vô hiệu hóa trước giờ START
      for (let i = 0; i < SystemOperatingHours.START; i++) hours.push(i)
      // Vô hiệu hóa sau giờ END
      for (let i = SystemOperatingHours.END; i < 24; i++) hours.push(i)
      return hours
    }

    // Nếu đã chọn ngày VÀ là ngày hiện tại
    if (selectedDate && selectedDate.isSame(now, 'day')) {
      return {
        disabledHours: () => {
          const hours = []
          // Vô hiệu hóa tất cả giờ trước giờ hiện tại
          for (let i = 0; i < currentHour; i++) hours.push(i)
          // Vô hiệu hóa sau giờ END
          for (let i = SystemOperatingHours.END; i < 24; i++) hours.push(i)
          return hours
        },
        disabledMinutes: (hour: number) => {
          if (hour === currentHour) {
            return Array.from({ length: currentMinute + BOOKING_BUFFER_MINUTES }, (_, i) => i)
          }
          return []
        },
      }
    }

    // Trường hợp chưa chọn ngày hoặc chọn ngày khác
    return {
      disabledHours: defaultDisabledHours,
      disabledMinutes: () => [],
    }
  }

  const handlePickupNowToggle = (checked: boolean) => {
    setPickupNow(checked)

    // If toggling off, reset date and time selections
    if (!checked) {
      onDateChange(null)
      onStartTimeChange(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* Pickup Now Option */}
      <Card
        className="mb-4 shadow-sm transition-shadow duration-300 hover:shadow-md"
        title={
          <div className="flex items-center gap-2 text-sm text-gray-700 sm:text-base">
            <ThunderboltOutlined className="text-yellow-500" />
            <span>Đón ngay bây giờ</span>
          </div>
        }
        styles={{ body: { padding: '12px' } }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 sm:text-base">Đặt xe ngay lập tức</span>
          <Switch
            checked={pickupNow}
            onChange={handlePickupNowToggle}
            className="bg-gray-300"
            checkedChildren="Có"
            unCheckedChildren="Không"
          />
        </div>
      </Card>

      {/* Grid container with responsive columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {/* Date Selection Card */}
        <Card
          className="shadow-sm transition-shadow duration-300 hover:shadow-md"
          title={
            <div className="flex items-center gap-2 text-sm text-gray-700 sm:text-base">
              <CalendarOutlined className="text-blue-500" />
              <span>Chọn ngày</span>
            </div>
          }
          styles={{ body: { padding: '12px' } }}
        >
          <DatePicker
            className="w-full"
            format="DD/MM/YYYY"
            disabledDate={disabledDate}
            value={selectedDate}
            onChange={onDateChange}
            placeholder="Chọn ngày đặt xe"
            locale={locale}
            showToday={false}
            size="large"
            disabled={pickupNow}
          />
        </Card>

        {/* Time Selection Card */}
        <Card
          className="shadow-sm transition-shadow duration-300 hover:shadow-md"
          title={
            <div className="flex items-center gap-2 text-sm text-gray-700 sm:text-base">
              <ClockCircleOutlined className="text-blue-500" />
              <span>Chọn giờ</span>
            </div>
          }
          styles={{ body: { padding: '12px' } }}
        >
          <TimePicker
            className="w-full"
            format="HH:mm"
            value={startTime}
            onChange={onStartTimeChange}
            placeholder="Chọn giờ đặt xe"
            locale={locale}
            disabledTime={disabledTime}
            minuteStep={1}
            size="large"
            showNow={false}
            disabled={pickupNow}
          />
        </Card>
      </div>
    </div>
  )
}

export default RouteDateTimeSelection
