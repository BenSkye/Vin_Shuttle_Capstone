'use client';
import { useState } from 'react';
import { Steps } from 'antd';

// import { AvailableVehicle } from "@/interface/booking";

import { FaClock, FaCar, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import dayjs from "dayjs";
import { AvailableVehicle, BookingHourRequest, BookingResponse } from "@/interface/booking";

import dynamic from "next/dynamic";


const steps = [
    { title: "Chọn ngày & giờ", icon: <FaClock /> },
    { title: "Chọn loại xe", icon: <FaCar /> },
    { title: "Chọn lộ trình", icon: <FaClock /> },
    { title: "Chọn địa điểm đón", icon: <FaMapMarkerAlt /> },
    { title: "Thanh toán", icon: <FaMoneyBillWave /> },
];


const DateTimeSelection = dynamic(() => import("../../components/booking/bookingcomponents/datetimeselection"), { ssr: false });
const LocationSelection = dynamic(() => import("../../components/booking/bookingcomponents/locationselection"), { ssr: false });
const BusRoutes = dynamic(() => import("../../components/booking/bookingcomponents/busroutes"), { ssr: false });
const CheckoutPage = dynamic(() => import("../../components/booking/bookingcomponents/checkoutpage"), { ssr: false });
const VehicleSelection = dynamic(() => import("../../components/booking/bookingcomponents/vehicleselection"), { ssr: false });

const RouteBooking = () => {
    const [current, setCurrent] = useState(0);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([]);
    const [selectedVehicles, setSelectedVehicles] = useState<BookingHourRequest['vehicleCategories']>([]);
    const [duration, setDuration] = useState<number>(60);
    const [startPoint, setStartPoint] = useState<{
        position: { lat: number; lng: number };
        address: string;
    }>({
        position: { lat: 10.840405, lng: 106.843424 },
        address: ''
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);

    const [loading, setLoading] = useState(false);

    const next = () => setCurrent((prev) => prev + 1);
    const prev = () => setCurrent((prev) => prev - 1);

    const handleLocationChange = (newPosition: { lat: number; lng: number }, newAddress: string) => {
        setLoading(true);
        setStartPoint({
            position: newPosition,
            address: newAddress
        });
        setLoading(false);
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

    const handleFinish = () => {
        // Add logic to handle booking completion
    };



    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full px-4 py-8">
                <div className="container mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
                            Đặt xe theo tuyến
                        </h1>

                        <div className="mb-10 w-full">
                            <div className="hidden sm:block">
                                <Steps
                                    current={current}
                                    items={steps}
                                    className="custom-steps"
                                />
                            </div>
                            <div className="sm:hidden">
                                <p className="text-center text-gray-600">
                                    Bước {current + 1}/{steps.length}: {steps[current].title}
                                </p>
                            </div>
                        </div>

                        <div className="w-full transition-all duration-300 ease-in-out">
                            <div className="mb-8 w-full">
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
                                    />
                                )}
                                {current === 2 && <BusRoutes />}
                                {current === 3 && (
                                    <LocationSelection
                                        startPoint={startPoint}
                                        onLocationChange={handleLocationChange}
                                        loading={loading}
                                        detectUserLocation={detectUserLocation}
                                    />
                                )}
                                {current === 4 && bookingResponse && (
                                    <CheckoutPage bookingResponse={bookingResponse} />
                                )}
                            </div>

                            <div className="flex justify-between mt-8 gap-4">
                                {current > 0 && (
                                    <button
                                        onClick={prev}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg 
                                    hover:bg-gray-200 transition-colors duration-200 ease-in-out
                                        focus:outline-none focus:ring-2 focus:ring-gray-300
                                        min-w-[120px]"
                                    >
                                        Quay lại
                                    </button>
                                )}
                                {current < steps.length - 1 ? (
                                    <button
                                        onClick={next}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-lg 
                                    hover:bg-blue-600 transition-colors duration-200 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-blue-300
                                        disabled:bg-blue-300 disabled:cursor-not-allowed
                                        min-w-[120px]"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Đang xử lý...
                                            </span>
                                        ) : (
                                            'Tiếp theo'
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFinish}
                                        className="px-6 py-3 bg-green-500 text-white rounded-lg 
                                    hover:bg-green-600 transition-colors duration-200 ease-in-out
                                        focus:outline-none focus:ring-2 focus:ring-green-300
                                        min-w-[120px]"
                                    >
                                        Xác nhận đặt xe
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteBooking;
