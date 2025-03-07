'use client';
import React, { useState, useEffect } from "react";
import { FaCar, FaClock, FaCreditCard, FaMapMarkerAlt } from "react-icons/fa";

import TripTypeSelection from "../../components/booking/bookingcomponents/triptypeselection";
import CheckoutPage from "../../components/booking/bookingcomponents/checkoutpage";
import { AvailableVehicle, BookingDestinationRequest, BookingResponse } from "@/interface/booking";
import dynamic from 'next/dynamic';
import { bookingDestination } from "@/service/booking.service";
import { vehicleSearchDestination } from "@/service/search.service";


const steps = [
    { title: "Chọn số người", icon: <FaClock className="text-blue-500" /> },
    { title: "Chọn điểm đón", icon: <FaMapMarkerAlt className="text-blue-500" /> },
    { title: "Chọn điểm đến", icon: <FaMapMarkerAlt className="text-blue-500" /> },
    { title: "Chọn xe", icon: <FaCar className="text-blue-500" /> },
    { title: "Thanh toán", icon: <FaCreditCard className="text-blue-500" /> },
];

const LineBookingPage = () => {
    const [tripType, setTripType] = useState<"alone" | "shared">("alone");
    const [passengerCount, setPassengerCount] = useState(1);
    const [current, setCurrent] = useState(0);
    const [startPoint, setStartPoint] = useState<{
        position: { lat: number; lng: number };
        address: string;
    }>({
        position: { lat: 10.840405, lng: 106.843424 },
        address: ''
    });
    const [endPoint, setEndPoint] = useState<{
        position: { lat: number; lng: number };
        address: string;
    }>({
        position: { lat: 10.8468, lng: 106.8375 },
        address: ''
    });


    const [loading, setLoading] = useState(false);
    const [pickup, setPickup] = useState<string>('');
    const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
    const [isBrowser, setIsBrowser] = useState(false);
    const [availableVehicles, setAvailableVehicles] = useState<AvailableVehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<{
        categoryVehicleId: string;
        name: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Set default values for estimated distance and duration
    const [estimatedDistance, setEstimatedDistance] = useState<number>(2);
    const [estimatedDuration, setEstimatedDuration] = useState<number>(5);

    const LocationSelection = dynamic(
        () => import('../../components/booking/bookingcomponents/locationselection'),
        { ssr: false }
    );
    const DestinationLocation = dynamic(
        () => import('../../components/booking/bookingcomponents/destinationLocation'),
        { ssr: false }
    );
    const DesVehicleSelection = dynamic(
        () => import('../../components/booking/bookingcomponents/desvehicleselection'),
        { ssr: false }
    );

    // Check if code is running in browser
    useEffect(() => {
        setIsBrowser(true);
    }, []);

    const handleStartLocationChange = (newPosition: { lat: number; lng: number }, newAddress: string) => {
        setStartPoint({
            position: newPosition,
            address: newAddress
        });
    };

    const handleEndLocationChange = (newPosition: { lat: number; lng: number }, newAddress: string) => {
        setEndPoint({
            position: newPosition,
            address: newAddress
        });
    };

    const calculateDistance = () => {
        // Calculate distance in km between two points using Haversine formula
        const R = 6371; // Radius of the Earth in km
        const dLat = (endPoint.position.lat - startPoint.position.lat) * Math.PI / 180;
        const dLon = (endPoint.position.lng - startPoint.position.lng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(startPoint.position.lat * Math.PI / 180) * Math.cos(endPoint.position.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // Calculate estimated duration (rough estimate: 1 km = 2 minutes)
        const duration = Math.ceil(distance * 2);

        setEstimatedDistance(parseFloat(distance.toFixed(2)) || 2);
        setEstimatedDuration(duration || 5);

        return { distance, duration };
    };

    const next = () => setCurrent(current + 1);
    const prev = () => setCurrent(current - 1);

    const detectUserLocation = async () => {
        if (!isBrowser) return; // Only run in browser

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

    const handleVehicleSelection = (categoryId: string, name: string, selected: boolean) => {
        console.log('Vehicle selection event:', { categoryId, name, selected });
        console.log('Current selection before update:', selectedVehicle);

        if (selected) {
            // Set this as the only selected vehicle
            setSelectedVehicle({ categoryVehicleId: categoryId, name });
            console.log('Setting selection to:', { categoryVehicleId: categoryId, name });
        } else if (selectedVehicle?.categoryVehicleId === categoryId) {
            // If deselecting the currently selected vehicle, clear selection
            setSelectedVehicle(null);
            console.log('Clearing selection');
        }
    };

    const fetchAvailableVehicles = async () => {
        setLoading(true);
        setError(null);

        try {
            // Use calculateDistance to update estimatedDistance and estimatedDuration
            calculateDistance();

            if (!startPoint.address || !endPoint.address) {
                setError("Vui lòng chọn địa điểm đón và trả khách");
                setLoading(false);
                return false;
            }

            console.log('Calling vehicleSearchDestination with params:', {
                startPoint: startPoint.position,

                endPoint: endPoint.position,
                estimatedDuration: estimatedDuration || 5,
                estimatedDistance: estimatedDistance || 2,

            });

            // Call API to get available vehicles using vehicleSearchDestination
            const vehicles = await vehicleSearchDestination(
                estimatedDuration || 5,
                estimatedDistance || 2,
                endPoint.position,
                startPoint.position
            );

            console.log('vehicleSearchDestination response:', vehicles);
            setAvailableVehicles(vehicles);
            next();
            return true;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setError(error instanceof Error ? error.message : "Không thể tìm thấy phương tiện phù hợp");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const canProceedToNextStep = () => {
        switch (current) {
            case 0:
                return passengerCount > 0;
            case 1:
                return !!startPoint.address.trim();
            case 2:
                return !!endPoint.address.trim();
            case 3:
                return selectedVehicle !== null;
            default:
                return true;
        }
    };

    const handleFinish = async () => {
        if (!selectedVehicle) {
            setError("Vui lòng chọn loại xe");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Prepare the payload for booking destination
            const payload: BookingDestinationRequest = {
                startPoint: startPoint,
                endPoint: endPoint,
                estimatedDuration: estimatedDuration,
                distanceEstimate: estimatedDistance,
                vehicleCategories: selectedVehicle,
                paymentMethod: "pay_os"
            };


            console.log('Calling bookingDestination with payload:', payload);

            const response = await bookingDestination(payload);
            console.log('bookingDestination response:', response);

            setBookingResponse(response);
            next(); // Move to checkout page
        } catch (error) {
            console.error('Error creating booking:', error);
            setError(error instanceof Error ? error.message : "Không thể đặt xe");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
            <div className="max-w-5xl w-full bg-white p-10 rounded-lg shadow-lg">
                <div className="flex justify-between mb-10">
                    {steps.map((item, index) => (
                        <div key={item.title} className={`flex flex-col items-center ${index === current ? 'text-blue-500' : 'text-gray-400'}`}>
                            {item.icon}
                            <span className="mt-2 text-sm">{item.title}</span>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div>
                    {current === 0 && (
                        <TripTypeSelection
                            tripType={tripType}
                            onTripTypeChange={setTripType}
                            passengerCount={passengerCount}
                            onPassengerCountChange={setPassengerCount}
                        />
                    )}
                    {current === 1 && isBrowser && (
                        <LocationSelection
                            startPoint={startPoint}
                            onLocationChange={handleStartLocationChange}
                            loading={loading}
                            detectUserLocation={detectUserLocation}
                        />
                    )}
                    {current === 2 && (
                        <DestinationLocation
                            endPoint={endPoint}
                            onLocationChange={handleEndLocationChange}
                            loading={loading}
                            detectUserLocation={detectUserLocation}
                        />
                    )}
                    {current === 3 && isBrowser && (
                        <DesVehicleSelection
                            availableVehicles={availableVehicles}
                            selectedVehicle={selectedVehicle}
                            onSelectionChange={handleVehicleSelection}
                        />
                    )}
                    {current === 4 && bookingResponse && <CheckoutPage bookingResponse={bookingResponse} />}
                </div>

                <div className="flex justify-between mt-8">
                    {current > 0 && current < 5 && (
                        <button onClick={prev} className="px-6 py-2 bg-gray-400 text-white rounded">Quay lại</button>
                    )}
                    <div>
                        {current < steps.length - 1 && (
                            <button
                                onClick={() => {
                                    if (current === 2) {
                                        fetchAvailableVehicles();
                                    } else if (current === 3) {
                                        handleFinish();
                                    } else {
                                        next();
                                    }
                                }}
                                className="px-6 py-2 bg-blue-500 text-white rounded ml-2"
                                disabled={loading || !canProceedToNextStep()}
                            >
                                {loading ? "Đang xử lý..." : current === 2 ? "Tìm xe" : current === 3 ? "Xác nhận đặt xe" : "Tiếp theo"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LineBookingPage;