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
import { EnvironmentOutlined, CarOutlined, ClockCircleOutlined } from "@ant-design/icons";

import dayjs from "dayjs";
import DateTimeSelection from "./bookingcomponents/datetimeselection";
import VehicleSelection from "./bookingcomponents/vehicleselection";
import LocationSelection from "./bookingcomponents/locationselection";
import BusRoutes from "./bookingcomponents/busroutes";
import CheckoutPage from "./bookingcomponents/checkoutpage";

const { Step } = Steps;
const { Title } = Typography;

const steps = [
    { title: "Chọn ngày & giờ", icon: <ClockCircleOutlined /> },
    { title: "Chọn loại xe", icon: <CarOutlined /> },
    { title: "Chọn lộ trình", icon: <ClockCircleOutlined /> },
    { title: "Chọn địa điểm đón", icon: <EnvironmentOutlined /> },
    { title: "Thanh toán", icon: <EnvironmentOutlined /> },
];

const RouteBooking = () => {
    const [current, setCurrent] = useState(0);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [numberOfVehicles, setNumberOfVehicles] = useState(1);
    const [pickup, setPickup] = useState("");
    const [destination, setDestination] = useState("");
    const [loading, setLoading] = useState(false);

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const detectUserLocation = async () => {
        setLoading(true);
        try {
            if (!navigator.geolocation) {
                message.error("Trình duyệt không hỗ trợ định vị");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );
                    const data = await response.json();
                    setPickup(data.display_name);
                },
                () => {
                    message.error("Không thể xác định vị trí của bạn");
                }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 40 }}>
            <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>Đặt xe tuyến đường</Title>
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
                        onNumberOfVehiclesChange={setNumberOfVehicles}
                    />
                )}
                {current === 2 && (
                    <BusRoutes />

                )}
                {current === 3 && (
                    <LocationSelection
                        pickup={pickup}
                        destination={destination}
                        onPickupChange={setPickup}
                        onDestinationChange={setDestination}
                        detectUserLocation={detectUserLocation}
                        loading={loading} />
                )}
                {current === 4 && (
                    <CheckoutPage />
                )}

            </Card>

            <Row justify="space-between" style={{ marginTop: 30 }}>
                <Col>
                    {current > 0 && (
                        <Button
                            onClick={prev}
                            size="large"
                            style={{ padding: '8px 32px', height: 'auto', fontSize: '1.1rem' }}
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

                            size="large"
                            style={{ padding: '8px 32px', height: 'auto', fontSize: '1.1rem' }}
                        >
                            Tiếp theo
                        </Button>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default RouteBooking;
