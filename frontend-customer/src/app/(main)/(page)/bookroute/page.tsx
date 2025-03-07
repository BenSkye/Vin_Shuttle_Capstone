'use client';
import { useState } from 'react';
import { Steps } from 'antd';

// import { AvailableVehicle } from "@/interface/booking";

import { FaClock, FaCar, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import dayjs from "dayjs";
import { AvailableVehicle, BookingHourRequest, BookingResponse } from "@/interface/booking";
import dynamic from "next/dynamic";
import { vehicleSearchRoute } from "@/service/search.service";
import { RouteResponse } from "@/service/mapScenic";
import { bookingRoute } from '@/service/booking.service';


const steps = [
    { title: "Chọn ngày & giờ", icon: <FaClock /> },

    { title: "Chọn lộ trình", icon: <FaClock /> },
    { title: "Chọn loại xe", icon: <FaCar /> },
    { title: "Chọn địa điểm đón", icon: <FaMapMarkerAlt /> },

    { title: "Thanh toán", icon: <FaMoneyBillWave /> },
];


const DateTimeSelection = dynamic(() => import("../../components/booking/bookingcomponents/datetimeselection"), { ssr: false });
const LocationSelection = dynamic(() => import("../../components/booking/bookingcomponents/locationselection"), { ssr: false });
const CreateRoute = dynamic(() => import("../../components/map/createRoute"), { ssr: false });
const CheckoutPage = dynamic(() => import("../../components/booking/bookingcomponents/checkoutpage"), { ssr: false });
const VehicleSelection = dynamic(() => import("../../components/booking/bookingcomponents/vehicleselection"), { ssr: false });

const RouteBooking = () => {
    const [current, setCurrent] = useState(0);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);

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
    const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(null);


    const next = async () => {
        // Log date selection information when moving from step 0 (date selection) to step 1
        if (current === 0) {
            // Validate date and time selection before proceeding
            if (!selectedDate || !startTime) {
                alert('Vui lòng chọn ngày và giờ đặt xe');
                return;
            }

            console.log("Selected booking information:");
            console.log("Date:", selectedDate ? selectedDate.format('YYYY-MM-DD') : 'Not selected');
            console.log("Start time:", startTime ? startTime.format('HH:mm') : 'Not selected');
            console.log("Duration:", duration, "minutes");

            // Calculate estimated end time if both start time and duration are available
            if (startTime) {
                const endTime = startTime.add(duration, 'minute');
                console.log("Estimated end time:", endTime.format('HH:mm'));
            }
        }

        // If moving from route selection to vehicle selection, fetch available vehicles
        if (current === 1) {
            // Validate route selection before proceeding
            if (!selectedRoute) {
                alert('Vui lòng chọn lộ trình');
                return;
            }

            // Fetch vehicles immediately before advancing to next step
            await fetchAvailableVehicles();
        }

        // If moving from vehicle selection to location selection, check if vehicles are selected
        if (current === 2 && selectedVehicles.length === 0) {
            alert('Vui lòng chọn ít nhất một loại xe');
            return;
        }

        // If moving from location selection to checkout page, call handleFinish
        if (current === 3) {
            if (!startPoint.address) {
                alert('Vui lòng chọn địa điểm đón');
                return;
            }
            await handleFinish();
            return; // Don't increment current here as handleFinish will call next() if successful
        }

        setCurrent((prev) => prev + 1);
    };

    const prev = () => setCurrent((prev) => prev - 1);

    // You can also add logging when the date or time changes directly
    const handleDateChange = (date: dayjs.Dayjs | null) => {
        setSelectedDate(date);
        console.log("Date changed to:", date ? date.format('YYYY-MM-DD') : 'None');
    };

    const handleStartTimeChange = (time: dayjs.Dayjs | null) => {
        setStartTime(time);
        console.log("Start time changed to:", time ? time.format('HH:mm') : 'None');
    };

    const handleDurationChange = (newDuration: number) => {
        setDuration(newDuration);
        console.log("Duration changed to:", newDuration, "minutes");

        // Calculate and log the end time whenever duration changes
        if (startTime) {
            const endTime = startTime.add(newDuration, 'minute');
            console.log("Updated end time:", endTime.format('HH:mm'));
        }
    };

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



    const handleRouteSelection = (route: RouteResponse) => {
        setSelectedRoute(route);
        console.log("Selected route in parent component:", route._id);
    };

    const fetchAvailableVehicles = async () => {
        if (!selectedDate || !startTime || !selectedRoute) {
            console.warn("Cannot fetch vehicles: Missing date, time, or selected route");

            return;
        }

        setLoading(true);
        try {
            const response = await vehicleSearchRoute(
                selectedDate.format('YYYY-MM-DD'),
                startTime.format('HH:mm'),
                selectedRoute._id
            );

            // Ensure vehicles is always an array

            console.log("Available vehicles:", response);
            setAvailableVehicles(response);
        } catch (error: unknown) {
            console.error("Error fetching available vehicles:", error);
            setAvailableVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = async () => {
        try {
            setLoading(true);
            const response = await bookingRoute({
                date: selectedDate ? selectedDate.format('YYYY-MM-DD') : '',
                startTime: startTime ? startTime.format('HH:mm') : '',
                scenicRouteId: selectedRoute ? selectedRoute._id : '',
                startPoint: {
                    position: {
                        lat: startPoint.position.lat,
                        lng: startPoint.position.lng,
                    },
                    address: startPoint.address
                },
                vehicleCategories: selectedVehicles,
                paymentMethod: 'pay_os'
            });
            console.log("Booking response:", response);
            setBookingResponse(response);
            setLoading(false);
            next(); // This will move to step 4 (checkout)
        }
        catch (e) {
            console.error("Error booking route:", e);
            setLoading(false);
        }
    }

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
                                        onDateChange={handleDateChange} // Use the new handler with logging
                                        onStartTimeChange={handleStartTimeChange} // Use the new handler with logging
                                        onDurationChange={handleDurationChange} // Use the new handler with logging
                                    />
                                )}
                                {current === 1 && (
                                    <CreateRoute
                                        onRouteSelect={handleRouteSelection}
                                        selectedRoute={selectedRoute}
                                    />
                                )}
                                {current === 2 && (<VehicleSelection
                                    availableVehicles={availableVehicles}
                                    selectedVehicles={selectedVehicles}
                                    onSelectionChange={handleVehicleSelection}
                                />)}
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
                                <button
                                    onClick={current < steps.length - 1 ? next : () => { }}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-lg 
                                    hover:bg-blue-600 transition-colors duration-200 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-blue-300
                                        disabled:bg-blue-300 disabled:cursor-not-allowed
                                        min-w-[120px]"
                                    disabled={loading || current === steps.length - 1}
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
                                        current === 3 ? 'Xác nhận đặt xe' : 'Tiếp theo'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteBooking;
