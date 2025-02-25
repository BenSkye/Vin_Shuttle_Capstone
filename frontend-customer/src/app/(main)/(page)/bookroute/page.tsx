'use client';
import React, { useState } from "react";
import { FaClock, FaCar, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import dayjs from "dayjs";
import DateTimeSelection from "../../components/booking/bookingcomponents/datetimeselection";
// import { AvailableVehicle } from "@/interface/booking";
import LocationSelection from "../../components/booking/bookingcomponents/locationselection";
import BusRoutes from "../../components/booking/bookingcomponents/busroutes";
import CheckoutPage from "../../components/booking/bookingcomponents/checkoutpage";
import { BookingResponse } from "@/interface/booking";

const steps = [
    { title: "Chọn ngày & giờ", icon: <FaClock /> },
    { title: "Chọn loại xe", icon: <FaCar /> },
    { title: "Chọn lộ trình", icon: <FaClock /> },
    { title: "Chọn địa điểm đón", icon: <FaMapMarkerAlt /> },
    { title: "Thanh toán", icon: <FaMoneyBillWave /> },
];

const RouteBooking = () => {
    const [current, setCurrent] = useState(0);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
    const [duration, setDuration] = useState<number>(60);
    // const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([]);
    const [startPoint, setStartPoint] = useState<{
        position: { lat: number; lng: number };
        address: string;
    }>({
        position: { lat: 10.840405, lng: 106.843424 },
        address: ''
    });
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


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-10">
                <h2 className="text-2xl font-bold text-center mb-10">Đặt xe tuyến đường</h2>

                <div className="flex justify-between items-center mb-10">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`flex flex-col items-center text-center p-2 border-b-4 transition-all ${current === index ? "border-blue-500 text-blue-500" : "border-gray-300 text-gray-500"
                                }`}
                        >
                            {step.icon}
                            <span className="text-sm mt-1">{step.title}</span>
                        </div>
                    ))}
                </div>

                <div>
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
                        <LocationSelection
                            startPoint={startPoint}
                            onLocationChange={handleLocationChange}
                            loading={loading}
                            detectUserLocation={detectUserLocation}
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

                <div className="flex justify-between mt-8">
                    {current > 0 && (
                        <button onClick={prev} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                            Quay lại
                        </button>
                    )}
                    {current < steps.length - 1 ? (
                        <button onClick={next} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            Tiếp theo
                        </button>
                    ) : (
                        <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                            Xác nhận đặt xe
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RouteBooking;
