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
    Radio,
    Form,
    Input
} from "antd";
import { EnvironmentOutlined, CarOutlined, ClockCircleOutlined, CreditCardOutlined } from "@ant-design/icons";
import { FaCreditCard, FaPaypal, FaGooglePay } from "react-icons/fa";
import dayjs from "dayjs";
import DateTimeSelection from "./bookingcomponents/datetimeselection";
import VehicleSelection from "./bookingcomponents/vehicleselection";
import LocationSelection from "./bookingcomponents/locationselection";

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
    const [numberOfVehicles, setNumberOfVehicles] = useState(1);
    const [pickup, setPickup] = useState("");
    const [destination, setDestination] = useState("");
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("credit");
    const [form] = Form.useForm();

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

    const renderPaymentStep = () => {
        return (
            <div style={{ padding: '20px' }}>
                <Form form={form} layout="vertical" size="large">
                    <Form.Item
                        label={<span style={{ fontSize: '1.4rem' }}>Phương thức thanh toán</span>}
                        style={{ marginBottom: '40px' }}
                    >
                        <Radio.Group
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                        >
                            <Card style={{ marginBottom: '16px', padding: '20px' }}>
                                <Radio value="credit">
                                    <span style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center' }}>
                                        <FaCreditCard style={{ marginRight: 16, fontSize: '24px' }} /> Thẻ tín dụng
                                    </span>
                                </Radio>
                            </Card>
                            <Card style={{ marginBottom: '16px', padding: '20px' }}>
                                <Radio value="paypal">
                                    <span style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center' }}>
                                        <FaPaypal style={{ marginRight: 16, fontSize: '24px' }} /> PayPal
                                    </span>
                                </Radio>
                            </Card>
                            <Card style={{ marginBottom: '16px', padding: '20px' }}>
                                <Radio value="gpay">
                                    <span style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center' }}>
                                        <FaGooglePay style={{ marginRight: 16, fontSize: '24px' }} /> Google Pay
                                    </span>
                                </Radio>
                            </Card>
                        </Radio.Group>
                    </Form.Item>

                    {paymentMethod === "credit" && (
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item
                                    label={<span style={{ fontSize: '1.3rem' }}>Số thẻ</span>}
                                    name="cardNumber"
                                    rules={[{ required: true, message: "Vui lòng nhập số thẻ" }]}
                                >
                                    <Input
                                        placeholder="1234 5678 9012 3456"
                                        style={{
                                            height: '50px',
                                            fontSize: '1.2rem',
                                            padding: '8px 16px'
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    <Card style={{ marginTop: '40px', padding: '30px' }}>
                        <Title level={3}>Chi tiết thanh toán</Title>
                        <Row justify="space-between" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
                            <Col>Giá thuê xe:</Col>
                            <Col>{(500000 * numberOfVehicles).toLocaleString()} VND</Col>
                        </Row>
                        <Row justify="space-between" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
                            <Col>Thuế (10%):</Col>
                            <Col>{(50000 * numberOfVehicles).toLocaleString()} VND</Col>
                        </Row>
                        <div style={{ borderTop: '1px solid #f0f0f0', margin: '20px 0', paddingTop: '20px' }}>
                            <Row justify="space-between" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                                <Col>Tổng cộng:</Col>
                                <Col>{(550000 * numberOfVehicles).toLocaleString()} VND</Col>
                            </Row>
                        </div>
                    </Card>
                </Form>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 40 }}>
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
                        onNumberOfVehiclesChange={setNumberOfVehicles}
                    />
                )}
                {current === 2 && (
                    <LocationSelection
                        pickup={pickup}
                        destination={destination}
                        onPickupChange={setPickup}
                        onDestinationChange={setDestination}
                        detectUserLocation={detectUserLocation}
                        loading={loading}
                    />
                )}
                {current === 3 && renderPaymentStep()}
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
                            disabled={
                                (current === 0 && (!selectedDate || !selectedTime)) ||
                                (current === 1 && !vehicleType) ||
                                (current === 2 && !pickup)
                            }
                            size="large"
                            style={{ padding: '8px 32px', height: 'auto', fontSize: '1.1rem' }}
                        >
                            Tiếp theo
                        </Button>
                    )}
                    {current === steps.length - 1 && (
                        <Button
                            type="primary"
                            onClick={handleFinish}
                            size="large"
                            style={{ padding: '8px 32px', height: 'auto', fontSize: '1.1rem' }}
                        >
                            Xác nhận đặt xe
                        </Button>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default HourlyBookingPage;
