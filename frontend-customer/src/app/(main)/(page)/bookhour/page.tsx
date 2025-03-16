'use client'

import dynamic from 'next/dynamic';
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
import { EnvironmentOutlined, CarOutlined, ClockCircleOutlined, CreditCardOutlined,  } from "@ant-design/icons";
import dayjs from "dayjs";
import DateTimeSelection from "../../components/booking/bookingcomponents/datetimeselection";
import VehicleSelection from "../../components/booking/bookingcomponents/vehicleselection";
const LocationSelection = dynamic(() => import('../../components/booking/bookingcomponents/locationselection'), { ssr: false });
import CheckoutPage from "../../components/booking/bookingcomponents/checkoutpage";
import { vehicleSearchHour } from "@/service/search.service";
import { AvailableVehicle, BookingHourRequest, BookingResponse } from "@/interface/booking";
import { BookingHourDuration } from "@/constants/booking.constants";
import { bookingHour } from "@/service/booking.service";
import Alert from 'antd/es/alert/Alert';

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
    const [vehicleSearchError, setVehicleSearchError] = useState<string | null>(null);
    const [startPoint, setStartPoint] = useState<{
        position: { lat: number; lng: number };
        address: string;
    }>({
        position: { lat: 10.840405, lng: 106.843424 },
        address: ''
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log("Chạy trên client!");
        }
    }, []);

    const detectUserLocation = () => {
        if (typeof window === "undefined") return;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                console.log("User location:", latitude, longitude);
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div className="w-full min-h-[80vh] flex items-center justify-center p-4 sm:p-6 md:p-8 ">
            <Card className="w-full max-w-[1400px] p-6 sm:p-8 md:p-10 shadow-lg rounded-xl">
                <Title level={2} className="text-center text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8">
                    Đặt xe theo giờ
                </Title>

                <Steps
                    current={current}
                    className="mb-6 sm:mb-8 w-full"
                    size="small"
                    responsive
                >
                    {steps.map((item) => (
                        <Step key={item.title} title={item.title} icon={item.icon} />
                    ))}
                </Steps>

                <Card className="p-4 sm:p-6 md:p-8 w-full">
                    {current === 0 && (
                        <>
                            <DateTimeSelection
                                selectedDate={selectedDate}
                                startTime={startTime}
                                duration={duration}
                                onDateChange={setSelectedDate}
                                onStartTimeChange={setStartTime}
                                onDurationChange={setDuration}
                            />
                            {vehicleSearchError && (
                                <div className="mt-3">
                                    <Alert message="" description={vehicleSearchError} type="error" showIcon />
                                </div>
                            )}
                        </>
                    )}
                    {current === 1 && (
                        <VehicleSelection
                            availableVehicles={availableVehicles}
                            selectedVehicles={selectedVehicles}
                            onSelectionChange={() => {}} 
                        />
                    )}
                    {current === 2 && (
                        <LocationSelection
                            startPoint={startPoint}
                            onLocationChange={() => {}}
                            loading={loading}
                            detectUserLocation={detectUserLocation}
                        />
                    )}
                    {current === 3 && bookingResponse && <CheckoutPage bookingResponse={bookingResponse} />}
                </Card>

                <Row justify="space-between" className="mt-6 sm:mt-8 w-full">
                    <Col>
                        {current > 0 && (
                            <Button
                                onClick={() => setCurrent(current - 1)}
                                size="large"
                                className="px-4 sm:px-6 h-auto text-sm sm:text-base"
                            >
                                Quay lại
                            </Button>
                        )}
                    </Col>
                    <Col>
                        {current < steps.length - 1 && (
                            <Button
                                type="primary"
                                onClick={() => setCurrent(current + 1)}
                                size="large"
                                className="px-4 sm:px-6 h-auto text-sm sm:text-base"
                            >
                                Tiếp tục
                            </Button>
                        )}
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default HourlyBookingPage;
