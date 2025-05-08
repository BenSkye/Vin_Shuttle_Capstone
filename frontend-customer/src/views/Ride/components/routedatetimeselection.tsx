import { useEffect, useState } from 'react'
import { Tooltip } from 'antd'
import { CalendarOutlined, ClockCircleOutlined, ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Card, DatePicker, TimePicker, Switch } from 'antd'
import locale from 'antd/es/date-picker/locale/vi_VN'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

import {
  BOOKING_BUFFER_MINUTES,
  SystemOperatingHours,
} from '@/constants/booking.constants'

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

  useEffect(() => {
    if (pickupNow) {
      const now = dayjs()
      onDateChange(now)
      onStartTimeChange(now)
    }
  }, [pickupNow])

  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current < dayjs().startOf('day')
  }

  const disabledTime = () => {
    const now = dayjs()
    const selectedDay = selectedDate || now

    const defaultDisabledHours = () => {
      const hours = []
      for (let i = 0; i < 24; i++) {
        if (i < SystemOperatingHours.START || i > SystemOperatingHours.END) {
          hours.push(i)
        }
      }
      return hours
    }

    if (selectedDay.isSame(now, 'day')) {
      const currentHour = now.hour()
      const currentMinute = now.minute()

      return {
        disabledHours: () => {
          const hours = defaultDisabledHours()
          for (let i = 0; i < currentHour + 1; i++) {
            hours.push(i)
          }
          return hours
        },
        disabledMinutes: (hour: number) => {
          if (hour === currentHour) {
            const minutes = []
            for (let i = 0; i <= currentMinute + BOOKING_BUFFER_MINUTES; i++) {
              minutes.push(i)
            }
            return minutes
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 sm:px-6">
      {/* Pickup Now Option */}
      <Card
        className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
        bodyStyle={{ padding: '16px' }}
        title={
          <div className="flex items-center gap-3 text-base font-medium text-gray-800">
            <ThunderboltOutlined className="text-xl text-yellow-500" />
            <span>Đón ngay bây giờ</span>
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-gray-600">Đặt xe ngay lập tức</span>
            <Tooltip title="Xe sẽ đến đón bạn trong vòng 15-20 phút">
              <InfoCircleOutlined className="text-blue-500 hover:text-blue-600" />
            </Tooltip>
          </div>
          <Switch
            checked={pickupNow}
            onChange={handlePickupNowToggle}
            className={`${pickupNow ? 'bg-blue-500' : 'bg-gray-300'} transition-colors duration-300`}
            checkedChildren="Có"
            unCheckedChildren="Không"
          />
        </div>
      </Card>

      {/* Date & Time Selection */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Date Selection */}
        <Card
          className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
          bodyStyle={{ padding: '16px' }}
          title={
            <div className="flex items-center gap-3 text-base font-medium text-gray-800">
              <CalendarOutlined className="text-xl text-blue-500" />
              <span>Chọn ngày</span>
            </div>
          }
        >
          <DatePicker
            className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none"
            locale={locale}
            value={selectedDate}
            onChange={onDateChange}
            disabledDate={disabledDate}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày đón"
            disabled={pickupNow}
            showToday={false}
          />
        </Card>

        {/* Time Selection */}
        <Card
          className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
          bodyStyle={{ padding: '16px' }}
          title={
            <div className="flex items-center gap-3 text-base font-medium text-gray-800">
              <ClockCircleOutlined className="text-xl text-green-500" />
              <span>Chọn giờ</span>
            </div>
          }
        >
          <TimePicker
            className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 transition-all duration-300 hover:border-green-400 focus:border-green-500 focus:outline-none"
            locale={locale}
            value={startTime}
            onChange={onStartTimeChange}
            format="HH:mm"
            minuteStep={15}
            hideDisabledOptions
            disabledTime={disabledTime}
            placeholder="Chọn giờ đón"
            disabled={pickupNow}
            showNow={false}
          />
        </Card>
      </div>
    </div>
  )
}

export default RouteDateTimeSelection
