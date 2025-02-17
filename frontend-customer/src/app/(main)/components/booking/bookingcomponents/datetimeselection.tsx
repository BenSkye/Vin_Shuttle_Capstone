import React, { useMemo } from "react";
import { DatePicker, Card, Typography, Row, Col, Button, Space, Grid } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface DateTimeSelectionProps {
    selectedDate: dayjs.Dayjs | null;
    selectedTime: string;
    onDateChange: (date: dayjs.Dayjs | null) => void;
    onTimeChange: (time: string) => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
    selectedDate,
    selectedTime,
    onDateChange,
    onTimeChange
}) => {
    const screens = useBreakpoint();
    const isMobile = screens.xs;

    const timeSlots = useMemo(() => ([
        "1 tiếng", "2 tiếng", "3 tiếng", "4 tiếng", "5 tiếng"
    ]), []);

    const disabledDate = (current: dayjs.Dayjs) => {
        return current && current < dayjs().startOf('day');
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
                </Row>

                <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Chọn giờ:</Text>
                    <Card size="small" style={{ marginBottom: 16 }}>
                        <Row gutter={[8, 8]}>
                            {timeSlots.map((time) => (
                                <Col key={time} xs={8}>
                                    <Button
                                        type={selectedTime === time ? "primary" : "default"}
                                        onClick={() => onTimeChange(time)}
                                        style={{
                                            width: '100%',
                                            height: isMobile ? '40px' : '36px'
                                        }}
                                        icon={<ClockCircleOutlined />}
                                    >
                                        {time}
                                    </Button>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </div>
            </Space>
        </Card>
    );
};

export default DateTimeSelection;
