import React, { useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    MenuItem,
    Snackbar,
    Alert,
    Paper,
    Grid
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { styled } from "@mui/system";
import dayjs from "dayjs";
import { FaCar, FaMapMarkerAlt, FaClock } from "react-icons/fa";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s ease-in-out",
    "&:hover": {
        transform: "translateY(-5px)"
    }
}));

const StyledButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    transition: "all 0.3s ease-in-out",
    "&:hover": {
        transform: "scale(1.02)"
    }
}));

const vehicleTypes = [
    {
        value: "sedan",
        label: "Sedan",
        seats: 4,
        pricePerHour: 150000,
        description: "Xe 4 chỗ tiêu chuẩn"
    },
    {
        value: "suv",
        label: "SUV",
        seats: 7,
        pricePerHour: 200000,
        description: "Xe 7 chỗ gầm cao"
    },
    {
        value: "luxury",
        label: "Luxury",
        seats: 4,
        pricePerHour: 300000,
        description: "Xe 4 chỗ cao cấp"
    },
    {
        value: "van",
        label: "Van",
        seats: 16,
        pricePerHour: 350000,
        description: "Xe 16 chỗ"
    }
];

const HourlyBookingPage = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [hours, setHours] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [pickup, setPickup] = useState("");
    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });
    const [numberOfSeats, setNumberOfSeats] = useState("");
    const [numberOfVehicles, setNumberOfVehicles] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);

    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, "0");
        return `${hour}:00`;
    });

    const validateForm = () => {
        const newErrors = {};
        if (!selectedDate) newErrors.date = "Please select a date";
        if (!selectedTime) newErrors.time = "Please select a time";
        if (!hours) newErrors.hours = "Please select number of hours";
        if (!vehicleType) newErrors.vehicleType = "Please select a vehicle type";
        if (!pickup) newErrors.pickup = "Please enter pickup location";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setSnackbar({
                open: true,
                message: "Booking submitted successfully!",
                severity: "success"
            });
        }
    };

    const isDateValid = (date) => {
        return dayjs(date).isAfter(dayjs(), "day");
    };

    // Tính tổng giá khi các thông tin thay đổi
    React.useEffect(() => {
        if (vehicleType && hours && numberOfVehicles) {
            const selectedVehicle = vehicleTypes.find(v => v.value === vehicleType);
            if (selectedVehicle) {
                const price = selectedVehicle.pricePerHour * parseInt(hours) * numberOfVehicles;
                setTotalPrice(price);
            }
        }
    }, [vehicleType, hours, numberOfVehicles]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="md">
                <Box component="form" onSubmit={handleSubmit} sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Đặt xe theo giờ
                    </Typography>

                    <StyledPaper>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label=""
                                    value={selectedDate}
                                    onChange={(newValue) => setSelectedDate(newValue)}
                                    shouldDisableDate={(date) => !isDateValid(date)}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Select Time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    error={!!errors.time}
                                    helperText={errors.time}
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
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Number of Hours"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    error={!!errors.hours}
                                    helperText={errors.hours}
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <MenuItem key={i + 1} value={i + 1}>
                                            {i + 1} {i === 0 ? "hour" : "hours"}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Số ghế cần đặt"
                                    value={numberOfSeats}
                                    onChange={(e) => setNumberOfSeats(e.target.value)}
                                    error={!!errors.seats}
                                    helperText={errors.seats}
                                >
                                    {[4, 7, 16].map((seats) => (
                                        <MenuItem key={seats} value={seats}>
                                            {seats} ghế
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Chọn loại xe
                                </Typography>
                                <Grid container spacing={2}>
                                    {vehicleTypes.map((vehicle) => (
                                        <Grid item xs={12} sm={6} key={vehicle.value}>
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    border: vehicleType === vehicle.value ? '2px solid #1976d2' : '1px solid #ddd',
                                                    '&:hover': { borderColor: '#1976d2' }
                                                }}
                                                onClick={() => setVehicleType(vehicle.value)}
                                            >
                                                <Box display="flex" alignItems="center" mb={1}>
                                                    <FaCar size={24} style={{ marginRight: 8 }} />
                                                    <Typography variant="h6">{vehicle.label}</Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {vehicle.description}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Số ghế: {vehicle.seats}
                                                </Typography>
                                                <Typography variant="body2" color="primary">
                                                    {vehicle.pricePerHour.toLocaleString()}đ/giờ
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    type="number"
                                    fullWidth
                                    label="Số lượng xe"
                                    value={numberOfVehicles}
                                    onChange={(e) => setNumberOfVehicles(Math.max(1, parseInt(e.target.value) || 1))}
                                    InputProps={{
                                        inputProps: { min: 1 }
                                    }}
                                />
                            </Grid>

                            {totalPrice > 0 && (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                        <Typography variant="h6" gutterBottom>
                                            Chi tiết thanh toán
                                        </Typography>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <Typography>
                                                    Giá theo giờ: {(vehicleTypes.find(v => v.value === vehicleType)?.pricePerHour || 0).toLocaleString()}đ
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography>
                                                    Số giờ: {hours}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography>
                                                    Số lượng xe: {numberOfVehicles}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="h6" color="primary">
                                                    Tổng tiền: {totalPrice.toLocaleString()}đ
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Pickup Location"
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                    error={!!errors.pickup}
                                    helperText={errors.pickup}
                                    InputProps={{
                                        startAdornment: <FaMapMarkerAlt style={{ marginRight: 8 }} />
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <StyledButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                        >
                            Đặt xe ngay
                        </StyledButton>
                    </StyledPaper>
                </Box>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        sx={{ width: "100%" }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </LocalizationProvider>
    );
};

export default HourlyBookingPage;