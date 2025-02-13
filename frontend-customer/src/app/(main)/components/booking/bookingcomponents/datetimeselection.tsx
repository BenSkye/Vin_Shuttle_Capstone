import React from "react";
import { Space, DatePicker, Select } from "antd";
import { FaClock } from "react-icons/fa";
import dayjs, { Dayjs } from "dayjs";

interface DateTimeSelectionProps {
    selectedDate: Dayjs | null;
    selectedTime: string;
    onDateChange: (date: Dayjs | null) => void;
    onTimeChange: (time: string) => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
    selectedDate,
    selectedTime,
    onDateChange,
    onTimeChange,
}) => {
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, "0");
        return `${hour}:00`;
    });

    return (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {/* Date Picker */}
            <DatePicker
                value={selectedDate}
                onChange={onDateChange}
                disabledDate={(current) => current && current.isBefore(dayjs(), "day")}
                style={{ width: "100%" }}
                placeholder="Chọn ngày"
            />

            {/* Time Selection */}
            <Select
                value={selectedTime}
                onChange={onTimeChange}
                style={{ width: "100%" }}
                placeholder="Chọn giờ"
                suffixIcon={<FaClock />}
            >
                {timeSlots.map((time) => (
                    <Select.Option key={time} value={time}>
                        {time}
                    </Select.Option>
                ))}
            </Select>
        </Space>
    );
};

export default DateTimeSelection;
