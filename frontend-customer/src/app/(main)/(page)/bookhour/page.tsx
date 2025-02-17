'use client'
import React, { useState } from "react";
import {
    Steps,
    Button,
    Typography,
    Card,
    Row,
    Col,
    message,
} from "antd";
import { EnvironmentOutlined, CarOutlined, ClockCircleOutlined, CreditCardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DateTimeSelection from "../../components/booking/bookingcomponents/datetimeselection";
import VehicleSelection from "../../components/booking/bookingcomponents/vehicleselection";
import LocationSelection from "../../components/booking/bookingcomponents/locationselection";
import CheckoutPage from "../../components/booking/bookingcomponents/checkoutpage";

const { Step } = Steps;
const { Title } = Typography;

const steps = [
    { title: "Chọn ngày & giờ", icon: <ClockCircleOutlined /> },
    { title: "Chọn loại xe", icon: <CarOutlined /> },
    { title: "Chọn địa điểm đón", icon: <EnvironmentOutlined /> },
    { title: "Thanh toán", icon: <CreditCardOutlined /> },
];

const HourlyBookingPage = () => {
    const [current, setCurrent] = useState(0);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [pickup, setPickup] = useState(""); // Pickup location
    const [loading, setLoading] = useState(false); // Loading state for async operations
    const [numberOfVehicles, setNumberOfVehicles] = useState<{ [key: string]: number }>({});


    // Define detectUserLocation function
    const detectUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                console.log("User location:", latitude, longitude);
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    const handleNumberOfVehiclesChange = (type: string, count: number) => {
        setNumberOfVehicles((prevState) => ({
            ...prevState,
            [type]: count,  // Update count for the specific vehicle type
        }));
    };

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Simulate an API call or process
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate a 2-second delay
            message.success("Đặt xe thành công!");
        } catch (error) {
            message.error("Có lỗi xảy ra!");
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
            <Card style={{ maxWidth: 1200, width: "100%", padding: 40, boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderRadius: 12 }}>
                <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>Đặt xe theo giờ</Title>
                <Steps current={current} style={{ marginBottom: 40 }}>
                    {steps.map((item) => (
                        <Step key={item.title} title={item.title} icon={item.icon} />
                    ))}
                </Steps>

                <Card style={{ padding: 24 }}>
                    {current === 0 && (
                        <DateTimeSelection
                            selectedDate={selectedDate}
                            selectedTime={selectedTime}
                            onDateChange={setSelectedDate}
                            onTimeChange={setSelectedTime}
                        />
                    )}
                    {current === 1 && (
                        <VehicleSelection
                            vehicleType={vehicleType}
                            numberOfVehicles={numberOfVehicles}
                            onVehicleTypeChange={setVehicleType}
                            onNumberOfVehiclesChange={handleNumberOfVehiclesChange}
                        />


                    )}
                    {current === 2 && (
                        <LocationSelection
                            pickup={pickup}
                            onPickupChange={setPickup}
                            loading={loading}
                            detectUserLocation={detectUserLocation}  // Pass detectUserLocation here
                        />
                    )}
                    {current === 3 && <CheckoutPage />}
                </Card>

                <Row justify="space-between" style={{ marginTop: 30 }}>
                    <Col>
                        {current > 0 && (
                            <Button
                                onClick={prev}
                                size="large"
                                style={{ padding: "8px 32px", height: "auto", fontSize: "1.1rem" }}
                            >
                                Quay lại
                            </Button>
                        )}
                    </Col>
                    <Col>
                        {current < steps.length - 1 && (
                            <Button
                                type="primary"
                                onClick={next}
                                disabled={
                                    (current === 0 && (!selectedDate || !selectedTime)) ||
                                    (current === 1 && !vehicleType) ||
                                    (current === 2 && !pickup)
                                }
                                size="large"
                                style={{ padding: "8px 32px", height: "auto", fontSize: "1.1rem" }}
                            >
                                Tiếp theo
                            </Button>
                        )}
                        {current === steps.length - 1 && (
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                loading={loading}  // Show loading spinner while the async operation is in progress
                                size="large"
                                style={{ padding: "8px 32px", height: "auto", fontSize: "1.1rem" }}
                            >
                                Xác nhận đặt xe
                            </Button>
                        )}
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default HourlyBookingPage;
