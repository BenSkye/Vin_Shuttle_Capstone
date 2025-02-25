'use client'
import React, { useEffect, useState } from "react";
import {
    Steps,
    Button,
    Typography,
    Card,
    Row,
    Col,
    message,
    notification,
} from "antd";
import { EnvironmentOutlined, CarOutlined, ClockCircleOutlined, CreditCardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DateTimeSelection from "../../components/booking/bookingcomponents/datetimeselection";
import VehicleSelection from "../../components/booking/bookingcomponents/vehicleselection";
import LocationSelection from "../../components/booking/bookingcomponents/locationselection";
import CheckoutPage from "../../components/booking/bookingcomponents/checkoutpage";
import { vehicleSearchHour } from "@/service/search.service";
import { AvailableVehicle, BookingHourRequest } from "@/interface/booking";
import { BookingHourDuration } from "@/constants/booking.constants";

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
    const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
    const [duration, setDuration] = useState<number>(60);
    const [pickup, setPickup] = useState("");
    const [loading, setLoading] = useState(false);
    const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([]);
    const [selectedVehicles, setSelectedVehicles] = useState<BookingHourRequest['vehicleCategories']>([]);
    const [pickupLocation, setPickupLocation] = useState({
        lat: 10.840405,
        lng: 106.843424
    });
    const [booking, setBooking] = useState<BookingHourRequest>({
        startPoint: { lat: 0, lng: 0 },
        date: '',
        startTime: '',
        durationMinutes: 0,
        vehicleCategories: [],
        paymentMethod: 'pay_os'
    });

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

    const handleVehicleSelection = (categoryId: string, quantity: number) => {
        setSelectedVehicles(prev => {
            const existing = prev.find(v => v.categoryVehicleId === categoryId);
            if (existing) {
                if (quantity === 0) {
                    return prev.filter(v => v.categoryVehicleId !== categoryId);
                }
                return prev.map(v =>
                    v.categoryVehicleId === categoryId ? { ...v, quantity } : v
                );
            }
            return quantity > 0
                ? [...prev, { categoryVehicleId: categoryId, quantity }]
                : prev;
        });
    };

    const handlePositionChange = (lat: number, lng: number) => {
        setPickupLocation({ lat, lng });
        // Update booking state
        setBooking(prev => ({
            ...prev,
            startPoint: { lat, lng }
        }));
    };

    // Thêm hàm kiểm tra điều kiện next
    const canProceedToNextStep = () => {
        switch (current) {
            case 0:
                return !!selectedDate && !!startTime && duration >= BookingHourDuration.MIN || duration <= BookingHourDuration.MAX;
            case 1:
                return selectedVehicles.length > 0;
            case 2:
                return !!pickup;
            default:
                return true;
        }
    };

    // Thêm hàm fetch vehicles từ backend
    const fetchAvailableVehicles = async () => {
        try {
            console.log("fetchAvailableVehicles");
            setLoading(true);
            // Gọi API backend với các tham số đã chọn
            if (!selectedDate || !startTime) {
                throw new Error('Date and time are required');
            }
            const date = selectedDate.format('YYYY-MM-DD');
            const startTimeString = dayjs(startTime).format('HH:mm');
            const response = await vehicleSearchHour(date, startTimeString, duration);
            if (!Array.isArray(response)) {
                setAvailableVehicles([response] as AvailableVehicle[]);
            } else {
                setAvailableVehicles(response as AvailableVehicle[]);
            }
            return true;
        } catch (error: unknown) {
            notification.error({
                message: 'Không tìm thấy xe',
                description: error.message || 'Không thể tải danh sách xe',
            });
            setAvailableVehicles([]);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Sửa hàm next
    const next = async () => {
        if (!canProceedToNextStep()) {
            notification.warning({
                message: 'Vui lòng hoàn thành bước hiện tại',
                description: current === 1 ? 'Vui lòng chọn ít nhất một loại xe' : 'Vui lòng điền đầy đủ thông tin'
            });
            return;
        }

        if (current === 0) {
            const success = await fetchAvailableVehicles();
            if (!success) return;
        }
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

    useEffect(() => {
        setBooking({
            ...booking,
            date: selectedDate?.format('YYYY-MM-DD') || '',
            startTime: startTime?.format('HH:mm') || '',
            durationMinutes: duration,
            vehicleCategories: selectedVehicles,
            paymentMethod: 'pay_os'
        });
    }, [selectedDate, startTime, duration, selectedVehicles]);

    useEffect(() => {
        console.log(booking)
    }, [booking])

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
                            startTime={startTime}
                            duration={duration}
                            onDateChange={setSelectedDate}
                            onStartTimeChange={setStartTime}
                            onDurationChange={setDuration}
                        />
                    )}
                    {current === 1 && (
                        <VehicleSelection
                            availableVehicles={availableVehicles}
                            selectedVehicles={selectedVehicles}
                            onSelectionChange={handleVehicleSelection}
                        />)
                    }
                    {current === 2 && (
                        <LocationSelection
                            pickup={pickup}
                            onPickupChange={setPickup}
                            loading={loading}
                            detectUserLocation={detectUserLocation}
                            lat={pickupLocation.lat}
                            lng={pickupLocation.lng}
                            onPositionChange={handlePositionChange}
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
                                disabled={!canProceedToNextStep()}
                                loading={current === 0 && loading}
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
