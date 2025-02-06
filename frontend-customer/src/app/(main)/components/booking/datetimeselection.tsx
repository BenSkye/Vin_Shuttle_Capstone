import React from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { FaClock } from "react-icons/fa";
import dayjs from "dayjs";
import { Dayjs } from "dayjs";

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
    onTimeChange
}) => {
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, "0");
        return `${hour}:00`;
    });

    return (
        <Box>
            <DatePicker
                label="Chọn ngày"
                value={selectedDate}
                onChange={onDateChange}
                shouldDisableDate={(date) => !date?.isAfter(dayjs(), "day")}
                sx={{ mb: 2 }}
            />
            <TextField
                select
                fullWidth
                label="Chọn giờ"
                value={selectedTime}
                onChange={(e) => onTimeChange(e.target.value)}
                InputProps={{
                    startAdornment: <FaClock style={{ marginRight: 8 }} />
                }}
            >
                {timeSlots.map((time) => (
                    <MenuItem key={time} value={time}>
                        {time}
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    );
};

export default DateTimeSelection;
