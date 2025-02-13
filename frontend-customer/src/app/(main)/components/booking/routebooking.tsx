"use client";
import React, { useState } from "react";
import {
    Box,
    Container,
    Stepper,
    Step,
    StepLabel,
    Paper,
    Grid,
    Typography,
    Button
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import DateTimeSelection from "./bookingcomponents/datetimeselection";
import VehicleSelection from "./bookingcomponents/vehicleselection";
import Map from "../Map";
import LookUp from "../LookUp";

// Define the props for RouteBooking
interface RouteBookingProps {
    onTabChange: (newTab: string) => void;
    setPickup: React.Dispatch<React.SetStateAction<string | null>>;
    setDestination: React.Dispatch<React.SetStateAction<string | null>>;
}

const steps = ["Chọn thời gian", "Chọn phương tiện", "Chọn lộ trình"];

const RouteBooking: React.FC<RouteBookingProps> = ({ onTabChange }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [vehicleType, setVehicleType] = useState<string>("");
    const [numberOfVehicles, setNumberOfVehicles] = useState<number>(1);
    const [pickup, setPickupState] = useState<string | null>(null);
    const [destination, setDestinationState] = useState<string | null>(null);

    const handleTabChange = (newTab: string) => {
        onTabChange(newTab);
    };

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
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
                    <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                        <LookUp onTabChange={handleTabChange} setPickup={setPickupState} setDestination={setDestinationState} />
                        <Box sx={{ flex: 1, display: 'flex' }}>
                            <Map pickup={pickup || ""} destination={destination || ""} />
                        </Box>
                    </Box>
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
                        Đặt xe theo lộ trình
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
                            <Grid item xs={12} md={activeStep === 2 ? 12 : 8}>
                                {getStepContent(activeStep)}
                            </Grid>

                            {activeStep !== 2 && (
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
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>

                        <Box sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 3,
                            pt: 3,
                            borderTop: 1,
                            borderColor: 'grey.200'
                        }}>
                            {activeStep !== 0 && (
                                <Button onClick={handleBack} sx={{ mr: 2 }}>
                                    Quay lại
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={
                                    (activeStep === 0 && (!selectedDate || !selectedTime)) ||
                                    (activeStep === 1 && !vehicleType)
                                }
                            >
                                {activeStep === steps.length - 1 ? "Hoàn thành" : "Tiếp theo"}
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default RouteBooking;
