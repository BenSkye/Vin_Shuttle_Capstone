import { BOOKING_BUFFER_MINUTES, BookingHourDuration, SystemOperatingHours } from '@/constants/booking.constants'
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
  const disabledTime = () => {
    const now = dayjs();
    const currentHour = now.hour();
    const currentMinute = now.minute();

    // Luôn áp dụng khung giờ hệ thống (7h-23h) khi chưa chọn ngày hoặc chọn ngày không phải hôm nay
    const defaultDisabledHours = () => {
      const hours = [];
      // Vô hiệu hóa trước giờ START
      for (let i = 0; i < SystemOperatingHours.START; i++) hours.push(i);
      // Vô hiệu hóa sau giờ END
      for (let i = SystemOperatingHours.END; i < 24; i++) hours.push(i);
      return hours;
    };

    // Nếu đã chọn ngày VÀ là ngày hiện tại
    if (selectedDate && selectedDate.isSame(now, 'day')) {
      return {
        disabledHours: () => {
          const hours = [];
          // Vô hiệu hóa tất cả giờ trước giờ hiện tại
          for (let i = 0; i < currentHour; i++) hours.push(i);
          // Vô hiệu hóa sau giờ END
          for (let i = SystemOperatingHours.END; i < 24; i++) hours.push(i);
          return hours;
        },
        disabledMinutes: (hour: number) => {
          if (hour === currentHour) {
            return Array.from(
              { length: currentMinute + BOOKING_BUFFER_MINUTES },
              (_, i) => i
            );
          }
          return [];
        },
      };
    }

    // Trường hợp chưa chọn ngày hoặc chọn ngày khác
    return {
      disabledHours: defaultDisabledHours,
      disabledMinutes: () => [],
    };
  };

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
            disabledTime={disabledTime}
            minuteStep={1}
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
            min={BookingHourDuration.MIN} // Giá trị tối thiểu là 15 phút
            max={BookingHourDuration.MAX} // Giá trị tối đa là 300 phút
            step={15} // Bước nhảy 15 phút
            addonAfter="phút" // Hiển thị đơn vị "phút"
          />

          {/* Time Summary with responsive text */}
          {selectedDate && startTime && (
            <div className="mt-3 rounded-lg bg-blue-50 p-3 sm:p-4">
              <h4 className="mb-2 text-xs font-medium text-gray-700 sm:text-sm">
                Thông tin cuốc xe:
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
                  <span>{(duration / 60).toFixed(2)} giờ</span>
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
