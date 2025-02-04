'use client'

import { Box, Typography, Select, MenuItem, Button, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";
import { useState } from "react";

export default function LineBooking() {
    const [route, setRoute] = useState('');
    const [time, setTime] = useState('');

    const handleRouteChange = (event: SelectChangeEvent) => {
        setRoute(event.target.value);
    };

    const handleTimeChange = (event: SelectChangeEvent) => {
        setTime(event.target.value);
    };

    const handleSubmit = () => {
        // Handle form submission here
        console.log("Selected Route:", route);
        console.log("Selected Time:", time);
        alert(`Bạn đã chọn tuyến đường: ${route} và thời gian: ${time}`);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Đặt xe chung
            </Typography>

            {/* Route Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="route-label">Chọn tuyến đường</InputLabel>
                <Select
                    labelId="route-label"
                    value={route}
                    label="Chọn tuyến đường"
                    onChange={handleRouteChange}
                >
                    <MenuItem value="route1">Tuyến 1: Hà Nội - Hải Phòng</MenuItem>
                    <MenuItem value="route2">Tuyến 2: Hà Nội - Đà Nẵng</MenuItem>
                    <MenuItem value="route3">Tuyến 3: Hà Nội - TP.HCM</MenuItem>
                </Select>
            </FormControl>

            {/* Time Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="time-label">Chọn thời gian đi</InputLabel>
                <Select
                    labelId="time-label"
                    value={time}
                    label="Chọn thời gian đi"
                    onChange={handleTimeChange}
                >
                    <MenuItem value="morning">6:00 - 8:00</MenuItem>
                    <MenuItem value="afternoon">12:00 - 14:00</MenuItem>
                    <MenuItem value="evening">18:00 - 20:00</MenuItem>
                </Select>
            </FormControl>

            {/* Submit Button */}
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={!route || !time}
            >
                Xác nhận đặt xe
            </Button>
        </Box>
    );
}