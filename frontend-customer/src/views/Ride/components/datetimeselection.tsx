import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Card, DatePicker, Select, TimePicker } from 'antd'
import { InputNumber } from 'antd'
import locale from 'antd/es/date-picker/locale/vi_VN'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

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
      <h2 className="mb-4 text-center text-xl font-semibold text-gray-800 sm:text-2xl">Chọn ngày & giờ</h2>

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

      {/* Duration Selection Card */}
      <Card
        className="mt-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:mt-6"
        title={
          <div className="flex items-center gap-2 text-sm text-gray-700 sm:text-base">
            <ClockCircleOutlined className="text-blue-500" />
            <span>Thời gian thuê xe</span>
          </div>
        }
        styles={{ body: { padding: '12px' } }}
      >
        <div className="flex flex-col gap-4">
          <InputNumber
            className="w-full"
            value={duration}
            onChange={(value) => onDurationChange(value || 0)}
            size="large"
            min={15} // Giá trị tối thiểu là 15 phút
            max={1440} // Giá trị tối đa là 24 giờ (1440 phút)
            step={15} // Bước nhảy 15 phút
            addonAfter="phút" // Hiển thị đơn vị "phút"
          />

          {/* Time Summary with responsive text */}
          {selectedDate && startTime && (
            <div className="mt-3 rounded-lg bg-blue-50 p-3 sm:p-4">
              <h4 className="mb-2 text-xs font-medium text-gray-700 sm:text-sm">
                Thông tin chuyến đi:
              </h4>
              <div className="space-y-1 text-xs text-gray-600 sm:space-y-2 sm:text-sm">
                <p className="flex justify-between">
                  <span className="font-medium">Ngày đặt:</span>
                  <span>{selectedDate.format('DD/MM/YYYY')}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Giờ bắt đầu:</span>
                  <span>{startTime.format('HH:mm')}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Thời gian thuê:</span>
                  <span>{duration / 60} giờ</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Giờ kết thúc:</span>
                  <span>{startTime.add(duration, 'minute').format('HH:mm')}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default DateTimeSelection
