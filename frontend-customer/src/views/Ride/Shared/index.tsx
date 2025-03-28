'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import SharedLocation from '../components/sharedLocation'
import CheckoutPage from '../components/checkoutpage'
import { bookingShared } from '../../../service/booking.service'
import { BookingResponse, BookingSharedRequest } from '@/interface/booking.interface'

const SharedBookingFlow = () => {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState<'location' | 'checkout'>('location')
    const [startPoint, setStartPoint] = useState<{
        position: { lat: number; lng: number }
        address: string
    }>({
        position: { lat: 10.840405, lng: 106.843424 },
        address: '',
    })
    const [endPoint, setEndPoint] = useState<{
        position: { lat: number; lng: number }
        address: string
    }>({
        position: { lat: 10.840405, lng: 106.843424 },
        address: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [estimatedDistance, setEstimatedDistance] = useState<number>(2)
    const [estimatedDuration, setEstimatedDuration] = useState<number>(5)
    const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null)
    const [numberOfSeats, setNumberOfSeats] = useState<number>(2)
    //yes sir
    const handleStartLocationChange = (position: { lat: number; lng: number }, address: string) => {
        setStartPoint({ position, address })
        setLoading(false)
    }

    const handleEndLocationChange = (position: { lat: number; lng: number }, address: string) => {
        setEndPoint({ position, address })
        setLoading(false)
    }

    const handleDetectUserLocation = async () => {
        setLoading(true);

        try {
            if ('geolocation' in navigator) {
                // Get position from geolocation API
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                const { latitude, longitude } = position.coords;

                // Get the address from coordinates
                const address = await fetchAddress(latitude, longitude);

                // Update the start point with both position and address
                setStartPoint({
                    position: { lat: latitude, lng: longitude },
                    address: address || 'Vị trí hiện tại của bạn',
                });
            }
        } catch (error) {
            console.error('Error getting location:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get address from coordinates
    const fetchAddress = async (lat: number, lng: number): Promise<string> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lng}&zoom=18&format=json`
            );
            const data = await response.json();
            return data.display_name || 'Vị trí hiện tại của bạn';
        } catch (error) {
            console.error('Error fetching address:', error);
            return 'Vị trí hiện tại của bạn';
        }
    };

    const calculateDistance = () => {
        // Calculate distance in km between two points using Haversine formula
        const R = 6371 // Radius of the Earth in km
        const dLat = ((endPoint.position.lat - startPoint.position.lat) * Math.PI) / 180
        const dLon = ((endPoint.position.lng - startPoint.position.lng) * Math.PI) / 180
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((startPoint.position.lat * Math.PI) / 180) *
            Math.cos((endPoint.position.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        // Calculate estimated duration (rough estimate: 1 km = 2 minutes)
        const duration = Math.ceil(distance * 2)

        setEstimatedDistance(parseFloat(distance.toFixed(2)) || 2)
        setEstimatedDuration(duration || 5)

        return { distance, duration }
    }

    const handleNumberOfSeatsChange = (seats: number) => {
        setNumberOfSeats(seats)
    }

    const handleConfirmBooking = async () => {
        if (!startPoint.address || !endPoint.address) return

        setLoading(true)
        setError(null)

        try {
            const payload: BookingSharedRequest = {
                startPoint,
                endPoint,
                durationEstimate: estimatedDuration,
                distanceEstimate: estimatedDistance,
                numberOfSeat: numberOfSeats,
                paymentMethod: 'pay_os'
            }

            const response = await bookingShared(payload)
            setBookingResponse(response)
            setCurrentStep('checkout')
        } catch (error) {
            console.error('Error creating booking:', error)
            setError(error instanceof Error ? error.message : 'Không thể đặt xe')
        } finally {
            setLoading(false)
        }
    }

    const handleNextStep = () => {
        if (currentStep === 'location' && startPoint.address && endPoint.address) {
            calculateDistance()
            handleConfirmBooking()
        }
    }

    const handleBackStep = () => {
        if (currentStep === 'checkout') {
            setCurrentStep('location')
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 'location':
                return (
                    <div className="space-y-6">
                        <SharedLocation
                            startPoint={startPoint}
                            endPoint={endPoint}
                            onStartLocationChange={handleStartLocationChange}
                            onEndLocationChange={handleEndLocationChange}
                            detectUserLocation={handleDetectUserLocation}
                            loading={loading}
                            numberOfSeats={numberOfSeats}
                            onNumberOfSeatsChange={handleNumberOfSeatsChange}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleNextStep}
                                disabled={!startPoint.address || !endPoint.address}
                                className="rounded-lg bg-blue-500 px-6 py-2 text-white disabled:bg-gray-300"
                            >
                                {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                            </button>
                        </div>
                    </div>
                )

            case 'checkout':
                return (
                    <div className="space-y-6">
                        {bookingResponse && (
                            <CheckoutPage bookingResponse={bookingResponse} />
                        )}
                        <div className="flex justify-start">
                            <button
                                onClick={handleBackStep}
                                className="rounded-lg bg-gray-500 px-6 py-2 text-white"
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div
                        className={`flex-1 text-center ${currentStep === 'location' ? 'text-blue-500' : 'text-gray-500'
                            }`}
                    >
                        <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
                            <div
                                className={`h-full rounded-full ${currentStep === 'location' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <span>Chọn địa điểm</span>
                    </div>
                    <div
                        className={`flex-1 text-center ${currentStep === 'checkout' ? 'text-blue-500' : 'text-gray-500'
                            }`}
                    >
                        <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
                            <div
                                className={`h-full rounded-full ${currentStep === 'checkout' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                style={{ width: currentStep === 'checkout' ? '100%' : '0%' }}
                            />
                        </div>
                        <span>Thanh toán</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                    {error}
                </div>
            )}

            <div className="rounded-lg bg-white p-6 shadow-lg">{renderStepContent()}</div>
        </div>
    )
}

export default SharedBookingFlow
