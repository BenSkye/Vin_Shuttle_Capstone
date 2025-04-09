import { BOOKING_BUFFER_MINUTES, SystemOperatingHours } from '@/constants/booking.constants'
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

  // Disallow times less than 2 minutes from current time
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
    </div>
  )
}

export default RouteDateTimeSelection
