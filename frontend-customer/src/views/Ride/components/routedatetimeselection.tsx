import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Card, DatePicker, TimePicker } from 'antd'
import locale from 'antd/es/date-picker/locale/vi_VN'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

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
  // Disallow past dates
  const disabledDate = (current: dayjs.Dayjs) => {
    return current && current < dayjs().startOf('day')
  }

  // Disallow past times for today
  const disabledTime = (current: dayjs.Dayjs | null) => {
    if (!current || !selectedDate) return {}
    if (selectedDate.isSame(dayjs(), 'day')) {
      return {
        disabledHours: () => Array.from({ length: dayjs().hour() }, (_, i) => i),
        disabledMinutes: (hour: number) =>
          hour === dayjs().hour() ? Array.from({ length: dayjs().minute() }, (_, i) => i) : [],
      }
    }
    return {}
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
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
            disabledTime={() => disabledTime(startTime)}
            minuteStep={15}
            size="large"
            showNow={false}
          />
        </Card>
      </div>
    </div>
  )
}

export default RouteDateTimeSelection
