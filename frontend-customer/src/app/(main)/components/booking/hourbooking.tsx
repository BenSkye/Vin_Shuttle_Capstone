import React, { useState } from "react";
import {
    Box,
    Container,
    Typography,
    Button,
    Stepper,
    Step,
    StepLabel,
    Snackbar,
    Alert,
    Paper,
    Grid
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DateTimeSelection from "./datetimeselection";
import VehicleSelection from "./vehicleselection";
import LocationSelection from "./locationselection";
import dayjs from "dayjs";

const steps = ["Chọn ngày và giờ", "Chọn loại xe", "Chọn địa điểm đón"];

const HourlyBookingPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [vehicleType, setVehicleType] = useState<string>("");
    const [numberOfVehicles, setNumberOfVehicles] = useState<number>(1);
    const [pickup, setPickup] = useState<string>("");
    const [destination, setDestination] = useState<string>("");
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "error" | "info" | "success" | "warning"; // Corrected type for severity
    }>({
        open: false,
        message: "",
        severity: "success", // Default severity
    });
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep((prevStep) => prevStep + 1);
        } else {
            // Submit the form
            setSnackbar({
                open: true,
                message: "Đặt xe thành công!",
                severity: "success"
            });
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setSelectedDate(null);
        setSelectedTime("");
        setVehicleType("");
        setNumberOfVehicles(1);
        setPickup("");
    };

    const detectUserLocation = async () => {
        setLoading(true);
        try {
            if (!navigator.geolocation) {
                setSnackbar({
                    open: true,
                    message: "Trình duyệt không hỗ trợ định vị",
                    severity: "error"
                });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        setPickup(data.display_name);
                    } catch (error) {
                        console.error("Error reverse geocoding:", error);
                        setSnackbar({
                            open: true,
                            message: "Không thể xác định địa chỉ hiện tại",
                            severity: "error"
                        });
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setSnackbar({
                        open: true,
                        message: "Không thể xác định vị trí của bạn",
                        severity: "error"
                    });
                }
            );
        } finally {
            setLoading(false);
        }
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <DateTimeSelection
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        onDateChange={setSelectedDate}
                        onTimeChange={setSelectedTime}
                    />
                );
            case 1:
                return (
                    <VehicleSelection
                        vehicleType={vehicleType}
                        numberOfVehicles={numberOfVehicles}
                        onVehicleTypeChange={setVehicleType}
                        onNumberOfVehiclesChange={setNumberOfVehicles}
                    />
                );
            case 2:
                return (
                    <LocationSelection
                        pickup={pickup}
                        destination={destination}
                        onPickupChange={setPickup}
                        onDestinationChange={setDestination}
                        detectUserLocation={detectUserLocation}
                        loading={loading}
                    />
                );
            default:
                return "Unknown step";
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="xl">
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Đặt xe theo giờ
                    </Typography>

                    <Stepper
                        activeStep={activeStep}
                        alternativeLabel
                        sx={{
                            mb: 4,
                            maxWidth: '1200px',
                            mx: 'auto'
                        }}
                    >
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <Paper
                        sx={{
                            p: { xs: 2, md: 4 },
                            borderRadius: 2,
                            maxWidth: '1200px',
                            mx: 'auto'
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                {getStepContent(activeStep)}
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 3,
                                        bgcolor: 'grey.50',
                                        height: '100%'
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Thông tin đặt xe
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        {selectedDate && (
                                            <Typography>Ngày: {selectedDate.format('DD/MM/YYYY')}</Typography>
                                        )}
                                        {selectedTime && (
                                            <Typography>Giờ: {selectedTime}</Typography>
                                        )}
                                        {vehicleType && (
                                            <Typography>Loại xe: {vehicleType}</Typography>
                                        )}
                                        {pickup && (
                                            <Typography>Địa điểm đón: {pickup}</Typography>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                mt: 3,
                                pt: 3,
                                borderTop: 1,
                                borderColor: 'grey.200'
                            }}
                        >
                            {activeStep !== 0 && (
                                <Button onClick={handleBack} sx={{ mr: 2 }}>
                                    Quay lại
                                </Button>
                            )}
                            {activeStep === steps.length - 1 && (
                                <Button onClick={handleReset} sx={{ mr: 2 }} color="secondary">
                                    Đặt lại
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={
                                    (activeStep === 0 && (!selectedDate || !selectedTime)) ||
                                    (activeStep === 1 && !vehicleType) ||
                                    (activeStep === 2 && !pickup)
                                }
                            >
                                {activeStep === steps.length - 1 ? "Hoàn thành" : "Tiếp theo"}
                            </Button>
                        </Box>

                    </Paper>
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
