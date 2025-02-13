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
import { CarOutlined, ClockCircleOutlined, CreditCardOutlined } from "@ant-design/icons";



import LocationSelection from "./bookingcomponents/locationselection";
import TripTypeSelection from "./bookingcomponents/triptypeselection";
import CheckoutPage from "./bookingcomponents/checkoutpage";

const { Step } = Steps;
const { Title } = Typography;

const steps = [
    { title: "Chọn số người", icon: <ClockCircleOutlined /> },
    { title: "Chọn điểm đón", icon: <CarOutlined /> },

    { title: "Thanh toán", icon: <CreditCardOutlined /> },
];

const LineBookingPage = () => {
    const [tripType, setTripType] = useState<"alone" | "shared">("alone");
    const [passengerCount, setPassengerCount] = useState(1); // Thêm dòng này
    const [current, setCurrent] = useState(0);

    const [pickup, setPickup] = useState("");
    const [destination, setDestination] = useState("");
    const [loading, setLoading] = useState(false);


    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const handleFinish = () => {
        message.success("Đặt xe thành công!");
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
            <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
                Chọn đi chung hay đi một mình
            </Title>
            <Steps current={current} style={{ marginBottom: 40 }}>
                {steps.map((item) => (
                    <Step key={item.title} title={item.title} icon={item.icon} />
                ))}
            </Steps>

            <Card style={{ padding: 24 }}>
                {current === 0 && (
                    <TripTypeSelection
                        tripType={tripType}
                        onTripTypeChange={setTripType}
                        passengerCount={passengerCount}
                        onPassengerCountChange={setPassengerCount}
                    />
                )}
                {current === 1 && (
                    <LocationSelection
                        pickup={pickup}
                        destination={destination}
                        onPickupChange={setPickup}
                        onDestinationChange={setDestination}
                        detectUserLocation={detectUserLocation}
                        loading={loading}
                    />
                )}
                {current === 2 && (
                    <CheckoutPage />
                )}
            </Card>

            <Row justify="space-between" style={{ marginTop: 30 }}>
                <Col>
                    {current > 0 && (
                        <Button onClick={prev} size="large">
                            Quay lại
                        </Button>
                    )}
                </Col>
                <Col>
                    {current < steps.length - 1 && (
                        <Button type="primary" onClick={next} size="large">
                            Tiếp theo
                        </Button>
                    )}
                    {current === steps.length - 1 && (
                        <Button type="primary" onClick={handleFinish} size="large">
                            Xác nhận đặt xe
                        </Button>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default LineBookingPage;
