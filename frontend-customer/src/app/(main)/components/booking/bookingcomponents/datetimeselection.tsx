import React from "react";
import { DatePicker, Card, Typography, Row, Col, InputNumber, Space, Grid } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { BookingHourDuration, BOOKING_BUFFER_MINUTES } from '@/constants/booking.constants';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface DateTimeSelectionProps {
    selectedDate: dayjs.Dayjs | null;
    startTime: dayjs.Dayjs | null;
    duration: number;
    onDateChange: (date: dayjs.Dayjs | null) => void;
    onStartTimeChange: (time: dayjs.Dayjs | null) => void;
    onDurationChange: (duration: number) => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
    selectedDate,
    startTime,
    duration,
    onDateChange,
    onStartTimeChange,
    onDurationChange
}) => {
    const screens = useBreakpoint();
    const isMobile = screens.xs;

    const disabledDate = (current: dayjs.Dayjs) => {
        return current && current < dayjs().startOf('day');
    };

    const disabledDateTime = (current: dayjs.Dayjs) => {
        const isToday = selectedDate?.isSame(dayjs(), 'day');
        const now = dayjs();
        const currentHour = now.hour();
        const currentMinute = now.minute() + BOOKING_BUFFER_MINUTES;

        let disabledHours = Array.from({ length: 24 }, (_, i) => i)
            .filter(h => h < 6 || h >= 23);

        if (isToday) {
            const pastHours = Array.from({ length: currentHour }, (_, i) => i);
            disabledHours = [...new Set([...disabledHours, ...pastHours])];
        }

        return {
            disabledHours: () => disabledHours,
            disabledMinutes: (selectedHour: number) => {
                if (isToday && selectedHour === currentHour) {
                    return Array.from({ length: currentMinute }, (_, i) => i);
                }
                return [];
            }
        };
    };

    return (
        <Card
            bordered={false}
            style={{
                padding: isMobile ? "16px" : "24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title
                    level={3}
                    style={{
                        marginBottom: 24,
                        textAlign: 'center',
                        fontSize: isMobile ? "20px" : "24px"
                    }}
                >
                    Chọn ngày và giờ
                </Title>

                <Row gutter={[16, 24]}>
                    <Col xs={24} md={12}>
                        <Text strong>Chọn ngày:</Text>
                        <DatePicker
                            style={{ width: '100%', marginTop: 8 }}
                            value={selectedDate}
                            onChange={onDateChange}
                            disabledDate={disabledDate}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày"
                            size={isMobile ? "large" : "middle"}
                            suffixIcon={<CalendarOutlined />}
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <Text strong>Chọn giờ bắt đầu:</Text>
                        <DatePicker.TimePicker
                            style={{ width: '100%', marginTop: 8 }}
                            value={startTime}
                            onChange={onStartTimeChange}
                            disabledTime={disabledDateTime}
                            format="HH:mm"
                            minuteStep={1}
                            placeholder="Chọn giờ"
                            size={isMobile ? "large" : "middle"}
                            disabled={!selectedDate}
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <Text strong>Thời lượng (phút):</Text>
                        <InputNumber
                            style={{ width: '100%', marginTop: 8 }}
                            min={BookingHourDuration.MIN}
                            max={BookingHourDuration.MAX}
                            onChange={(value) => {
                                const numericValue = Math.min(
                                    Math.max(value || 30, 30),
                                    300
                                );
                                onDurationChange(numericValue);
                            }}
                            placeholder="Nhập thời lượng"
                        />
                    </Col>
                </Row>
            </Space>
        </Card>
    );
};

export default DateTimeSelection;
