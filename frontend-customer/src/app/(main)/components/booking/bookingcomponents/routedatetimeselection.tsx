import { DatePicker, TimePicker, Card } from 'antd';
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/es/date-picker/locale/vi_VN';

interface DateTimeSelectionProps {
    selectedDate: dayjs.Dayjs | null;
    startTime: dayjs.Dayjs | null;
    onDateChange: (date: dayjs.Dayjs | null) => void;
    onStartTimeChange: (time: dayjs.Dayjs | null) => void;
}

const RouteDateTimeSelection = ({
    selectedDate,
    startTime,
    onDateChange,
    onStartTimeChange,
}: DateTimeSelectionProps) => {
    // Disallow past dates
    const disabledDate = (current: dayjs.Dayjs) => {
        return current && current < dayjs().startOf('day');
    };

    // Disallow past times for today
    const disabledTime = (current: dayjs.Dayjs | null) => {
        if (!current || !selectedDate) return {};
        if (selectedDate.isSame(dayjs(), 'day')) {
            return {
                disabledHours: () => Array.from({ length: dayjs().hour() }, (_, i) => i),
                disabledMinutes: (hour: number) =>
                    hour === dayjs().hour()
                        ? Array.from({ length: dayjs().minute() }, (_, i) => i)
                        : [],
            };
        }
        return {};
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            {/* Grid container with responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Date Selection Card */}
                <Card
                    className="shadow-sm hover:shadow-md transition-shadow duration-300"
                    title={
                        <div className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                            <CalendarOutlined className="text-blue-500" />
                            <span>Chọn ngày</span>
                        </div>
                    }
                    bodyStyle={{ padding: '12px' }}
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
                    className="shadow-sm hover:shadow-md transition-shadow duration-300"
                    title={
                        <div className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                            <ClockCircleOutlined className="text-blue-500" />
                            <span>Chọn giờ</span>
                        </div>
                    }
                    bodyStyle={{ padding: '12px' }}
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
    );
};

export default RouteDateTimeSelection;