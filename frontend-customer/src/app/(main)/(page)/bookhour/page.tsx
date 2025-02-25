'use client'
import React, { useEffect, useState } from "react";
import {
    Steps,
    Button,
    Typography,
    Card,
    Row,
    Col,
    notification,
} from "antd";
import { EnvironmentOutlined, CarOutlined, ClockCircleOutlined, CreditCardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DateTimeSelection from "../../components/booking/bookingcomponents/datetimeselection";
import VehicleSelection from "../../components/booking/bookingcomponents/vehicleselection";
import LocationSelection from "../../components/booking/bookingcomponents/locationselection";
import CheckoutPage from "../../components/booking/bookingcomponents/checkoutpage";
import { vehicleSearchHour } from "@/service/search.service";
import { AvailableVehicle, BookingHourRequest, BookingResponse } from "@/interface/booking";
import { BookingHourDuration } from "@/constants/booking.constants";
import { bookingHour } from "@/service/booking.service";

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
    const [loading, setLoading] = useState(false);
    const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([]);
    const [selectedVehicles, setSelectedVehicles] = useState<BookingHourRequest['vehicleCategories']>([]);
    const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
    const [startPoint, setStartPoint] = useState<{
        position: { lat: number; lng: number };
        address: string;
    }>({
        position: { lat: 10.840405, lng: 106.843424 },
        address: ''
    });
    const [booking, setBooking] = useState<BookingHourRequest>({
        startPoint: { position: { lat: 0, lng: 0 }, address: '' },
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

    const handleLocationChange = (newPosition: { lat: number; lng: number }, newAddress: string) => {
        setStartPoint({
            position: newPosition,
            address: newAddress
        });
    };

    const canProceedToNextStep = () => {
        switch (current) {
            case 0:
                return !!selectedDate && !!startTime && duration >= BookingHourDuration.MIN || duration <= BookingHourDuration.MAX;
            case 1:
                return selectedVehicles.length > 0;
            case 2:
                return !!startPoint.address.trim();
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
        // Handle submission when moving to checkout
        if (current === 2) {
            try {
                await handleSubmit();
            } catch {
                return; // Prevent advancing on error
            }
        }
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await bookingHour(booking);
            setBookingResponse(response); // Store response
            return response; // Return for next step
        } catch (error: unknown) {
            notification.error({
                message: 'Lỗi đặt xe',
                description: error.message || 'Không thể đặt xe',
            });
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setBooking(prev => ({
            ...prev,
            startPoint: startPoint,
            date: selectedDate?.format('YYYY-MM-DD') || '',
            startTime: startTime?.format('HH:mm') || '',
            durationMinutes: duration,
            vehicleCategories: selectedVehicles
        }));
    }, [selectedDate, startTime, duration, selectedVehicles, startPoint]);

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
                            startPoint={startPoint}
                            onLocationChange={handleLocationChange}
                            loading={loading}
                            detectUserLocation={detectUserLocation}
                        />
                    )}
                    {current === 3 && <CheckoutPage bookingResponse={bookingResponse} />}
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
                                loading={(current === 0 || current === 2) && loading}
                                size="large"
                                style={{ padding: "8px 32px", height: "auto", fontSize: "1.1rem" }}
                            >
                                Tiếp theo
                            </Button>
                        )}
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default HourlyBookingPage;
