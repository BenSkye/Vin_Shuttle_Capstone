import { useEffect, useState } from 'react'
import { Tooltip } from 'antd'
import { CalendarOutlined, ClockCircleOutlined, ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Card, DatePicker, Select, Switch, TimePicker, Button } from 'antd'
import { InputNumber } from 'antd'
import locale from 'antd/es/date-picker/locale/vi_VN'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

import {
  BOOKING_BUFFER_MINUTES,
  BookingHourDuration,
  SystemOperatingHours,
} from '@/constants/booking.constants'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Option } = Select
interface DateTimeSelectionProps {
  selectedDate: dayjs.Dayjs | null
  startTime: dayjs.Dayjs | null
  duration: number
  onDateChange: (date: dayjs.Dayjs | null) => void
  onStartTimeChange: (time: dayjs.Dayjs | null) => void
  onDurationChange: (duration: number) => void
}

const DateTimeSelection = ({
  selectedDate,
  startTime,
  duration,
  onDateChange,
  onStartTimeChange,
  onDurationChange,
}: DateTimeSelectionProps) => {
  const [pickupNow, setPickupNow] = useState(false)

  // Set current date and time with buffer when "pickup now" is selected
  useEffect(() => {
    if (pickupNow) {
      const now = dayjs()
      const currentHour = now.hour()

      if (currentHour < SystemOperatingHours.START) {
        const systemStartTime = now.hour(SystemOperatingHours.START).minute(0).second(0)
        onDateChange(now)
        onStartTimeChange(systemStartTime)
      } else if (currentHour >= SystemOperatingHours.END) {
        const nextDay = now.add(1, 'day').hour(SystemOperatingHours.START).minute(0).second(0)
        onDateChange(nextDay)
        onStartTimeChange(nextDay)
      } else {
        const bufferedTime = now.add(BOOKING_BUFFER_MINUTES, 'minute')
        onDateChange(now)
        onStartTimeChange(bufferedTime)
      }
    }
  }, [pickupNow, onDateChange, onStartTimeChange])

  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current < dayjs().startOf('day')
  }

  const disabledTime = () => {
    const now = dayjs()
    const currentHour = now.hour()
    const currentMinute = now.minute()

    const defaultDisabledHours = () => {
      const hours = []
      for (let i = 0; i < SystemOperatingHours.START; i++) hours.push(i)
      for (let i = SystemOperatingHours.END; i < 24; i++) hours.push(i)
      return hours
    }

    if (selectedDate && selectedDate.isSame(now, 'day')) {
      return {
        disabledHours: () => {
          const hours = []
          for (let i = 0; i < currentHour; i++) hours.push(i)
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

    return {
      disabledHours: defaultDisabledHours,
      disabledMinutes: () => [],
    }
  }

  const handlePickupNowToggle = (checked: boolean) => {
    setPickupNow(checked)
    if (!checked) {
      onDateChange(null)
      onStartTimeChange(null)
    }
  }

  const handleDateChange = (date: dayjs.Dayjs | null) => onDateChange(date)
  const handleTimeChange = (time: dayjs.Dayjs | null) => onStartTimeChange(time)
  const handleDurationChange = (value: number | null) => onDurationChange(value || 0)

  const getEstimatedReturnTime = () => {
    if (!startTime || duration <= 0) return null
    return startTime.add(duration, 'minute').format('HH:mm')
  }

  const commonCardClasses = "overflow-hidden rounded-xl border-0 shadow-md transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400"

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6">
      <h2 className="text-center text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
        Chọn ngày & giờ
      </h2>

      {/* Pickup Now Option */}
      <Card
        className={commonCardClasses}
        title={
          <div className="flex items-center gap-3">
            <ThunderboltOutlined className="text-xl sm:text-2xl text-yellow-500" />
            <span className="text-base sm:text-lg font-medium">Đón ngay bây giờ</span>
          </div>
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base text-gray-600">
              Đặt xe ngay lập tức để được phục vụ sớm nhất
            </span>
            <Tooltip title="Hệ thống sẽ tự động chọn thời gian sớm nhất có thể">
              <InfoCircleOutlined className="text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </div>
          <Switch
            checked={pickupNow}
            onChange={handlePickupNowToggle}
            className={`${pickupNow ? 'bg-blue-500' : 'bg-gray-300'} transition-colors self-end sm:self-auto`}
            checkedChildren="Có"
            unCheckedChildren="Không"
            aria-label="Chọn đón ngay"
          />
        </div>
      </Card>

      {/* Grid container with responsive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Date Selection Card */}
        <Card
          className={commonCardClasses}
          title={
            <div className="flex items-center gap-3">
              <CalendarOutlined className="text-xl sm:text-2xl text-blue-500" />
              <span className="text-base sm:text-lg font-medium">Chọn ngày</span>
            </div>
          }
        >
          <div className="p-4">
            <DatePicker
              className="w-full transition-all hover:border-blue-400"
              format="DD/MM/YYYY"
              disabledDate={disabledDate}
              value={selectedDate}
              onChange={handleDateChange}
              placeholder="Chọn ngày đặt xe"
              locale={locale}
              showToday={false}
              size="large"
              disabled={pickupNow}
              aria-label="Chọn ngày đặt xe"
            />
          </div>
        </Card>

        {/* Time Selection Card */}
        <Card
          className={commonCardClasses}
          title={
            <div className="flex items-center gap-3">
              <ClockCircleOutlined className="text-xl sm:text-2xl text-blue-500" />
              <span className="text-base sm:text-lg font-medium">Chọn giờ</span>
            </div>
          }
        >
          <div className="p-4">
            <TimePicker
              className="w-full transition-all hover:border-blue-400"
              format="HH:mm"
              value={startTime}
              onChange={handleTimeChange}
              placeholder="Chọn giờ đặt xe"
              locale={locale}
              disabledTime={disabledTime}
              minuteStep={15}
              size="large"
              showNow={false}
              disabled={pickupNow}
              aria-label="Chọn giờ đặt xe"
            />
          </div>
        </Card>
      </div>

      {/* Duration Selection Card */}
      <Card
        className={commonCardClasses}
        title={
          <div className="flex items-center gap-3">
            <ClockCircleOutlined className="text-xl sm:text-2xl text-blue-500" />
            <span className="text-base sm:text-lg font-medium">Thời gian thuê xe</span>
          </div>
        }
      >
        <div className="space-y-6 p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base text-gray-600">Chọn thời gian thuê xe</span>
              <Tooltip title="Thời gian tối thiểu là 1 giờ và tối đa là 8 giờ">
                <InfoCircleOutlined className="text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full">
                <InputNumber
                  className="w-full"
                  value={duration}
                  onChange={handleDurationChange}
                  size="large"
                  min={BookingHourDuration.MIN}
                  max={BookingHourDuration.MAX}
                  step={15}
                  addonAfter="phút"
                  aria-label="Nhập thời gian thuê xe"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[60, 120, 180].map((mins) => (
                  <Button
                    key={mins}
                    size="large"
                    type={duration === mins ? 'primary' : 'default'}
                    onClick={() => handleDurationChange(mins)}
                    className={`
                      w-full transition-all text-sm sm:text-base
                      ${duration === mins ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:border-blue-400'}
                    `}
                    aria-label={`Chọn ${mins / 60} giờ`}
                  >
                    {mins / 60}h
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {startTime && duration > 0 && (
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-600">Thời gian trả xe dự kiến:</span>
                <span className="text-base sm:text-lg font-medium text-blue-600">
                  {getEstimatedReturnTime()}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default DateTimeSelection
