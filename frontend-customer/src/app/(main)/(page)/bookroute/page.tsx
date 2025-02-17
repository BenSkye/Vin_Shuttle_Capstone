'use client';
import React, { useState } from "react";
import { FaClock, FaCar, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import dayjs from "dayjs";
import DateTimeSelection from "../../components/booking/bookingcomponents/datetimeselection";
import VehicleSelection from "../../components/booking/bookingcomponents/vehicleselection";
import LocationSelection from "../../components/booking/bookingcomponents/locationselection";
import BusRoutes from "../../components/booking/bookingcomponents/busroutes";
import CheckoutPage from "../../components/booking/bookingcomponents/checkoutpage";

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
    const [selectedTime, setSelectedTime] = useState("");
    const [vehicleType, setVehicleType] = useState<string>("");
    const [numberOfVehicles, setNumberOfVehicles] = useState<{ [key: string]: number }>({});
    const [pickup, setPickup] = useState("");

    const [loading, setLoading] = useState(false);

    const next = () => setCurrent((prev) => prev + 1);
    const prev = () => setCurrent((prev) => prev - 1);

    const handleDateChange = (date: dayjs.Dayjs | null) => {
        setSelectedDate(date);
    };

    const handleTimeChange = (time: string) => {
        setSelectedTime(time);
    };

    const handleVehicleTypeChange = (type: string) => {
        setVehicleType(type);
    };

    const handleNumberOfVehiclesChange = (type: string, count: number) => {
        setNumberOfVehicles((prevState) => ({
            ...prevState,
            [type]: count,
        }));
    };

    const detectUserLocation = async () => {
        setLoading(true);
        try {
            if (!navigator.geolocation) {
                alert("Trình duyệt không hỗ trợ định vị");
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
                () => alert("Không thể xác định vị trí của bạn")
            );
        } finally {
            setLoading(false);
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
                            selectedTime={selectedTime}
                            onDateChange={handleDateChange}
                            onTimeChange={handleTimeChange}
                        />
                    )}
                    {current === 1 && (
                        <VehicleSelection
                            vehicleType={vehicleType}
                            numberOfVehicles={numberOfVehicles}
                            onVehicleTypeChange={handleVehicleTypeChange}
                            onNumberOfVehiclesChange={handleNumberOfVehiclesChange}
                        />
                    )}
                    {current === 2 && <BusRoutes />}
                    {current === 3 && (
                        <LocationSelection
                            pickup={pickup}
                            onPickupChange={setPickup}
                            loading={loading}
                            detectUserLocation={detectUserLocation}  // Pass detectUserLocation here
                        />
                    )}
                    {current === 4 && (
                        <CheckoutPage

                        />
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
