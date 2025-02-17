'use client';
import React, { useState } from "react";
import { FaCar, FaClock, FaCreditCard } from "react-icons/fa";
import LocationSelection from "../../components/booking/bookingcomponents/locationselection";
import TripTypeSelection from "../../components/booking/bookingcomponents/triptypeselection";
import CheckoutPage from "../../components/booking/bookingcomponents/checkoutpage";

const steps = [
    { title: "Chọn số người", icon: <FaClock className="text-blue-500" /> },
    { title: "Chọn điểm đón", icon: <FaCar className="text-blue-500" /> },
    { title: "Thanh toán", icon: <FaCreditCard className="text-blue-500" /> },
];

const LineBookingPage = () => {
    const [tripType, setTripType] = useState<"alone" | "shared">("alone");

    const [passengerCount, setPassengerCount] = useState(1);
    const [current, setCurrent] = useState(0);
    const [pickup, setPickup] = useState("");

    const [loading, setLoading] = useState(false);

    const next = () => setCurrent(current + 1);
    const prev = () => setCurrent(current - 1);
    const handleFinish = () => alert("Đặt xe thành công!");

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
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
            <div className="max-w-5xl w-full bg-white p-10 rounded-lg shadow-lg">
                <h2 className="text-center text-2xl font-bold mb-10">Chọn đi chung hay đi một mình</h2>

                <div className="flex justify-between mb-10">
                    {steps.map((item, index) => (
                        <div key={item.title} className={`flex flex-col items-center ${index === current ? 'text-blue-500' : 'text-gray-400'}`}>
                            {item.icon}
                            <span className="mt-2 text-sm">{item.title}</span>
                        </div>
                    ))}
                </div>

                <div>
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

                            onPickupChange={setPickup}

                            detectUserLocation={detectUserLocation}
                            loading={loading}
                        />
                    )}
                    {current === 2 && <CheckoutPage />}
                </div>

                <div className="flex justify-between mt-8">
                    {current > 0 && (
                        <button onClick={prev} className="px-6 py-2 bg-gray-400 text-white rounded">Quay lại</button>
                    )}
                    <div>
                        {current < steps.length - 1 && (
                            <button onClick={next} className="px-6 py-2 bg-blue-500 text-white rounded ml-2">Tiếp theo</button>
                        )}
                        {current === steps.length - 1 && (
                            <button onClick={handleFinish} className="px-6 py-2 bg-green-500 text-white rounded ml-2">Xác nhận đặt xe</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LineBookingPage;
