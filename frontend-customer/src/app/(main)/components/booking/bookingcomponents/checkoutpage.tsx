"use client";
import React, { useCallback, useEffect, useState } from "react";
import { ServiceType } from "@/constants/service-type.enum";
import { Trip, BookingHourPayloadDto, BookingScenicRoutePayloadDto, BookingDestinationPayloadDto, BookingSharePayloadDto } from "@/interface/trip";
import { BookingResponse } from "@/interface/booking";
import { getPersonalTripById } from "@/service/trip.service";


const CheckoutPage = ({ bookingResponse }: { bookingResponse: BookingResponse }) => {
    const [booking, setBooking] = useState<BookingResponse["newBooking"] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [trips, setTrips] = useState<Trip[] | null>(null);
    const [paymentUrl, setPaymentUrl] = useState("");
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        if (shouldRedirect && typeof window !== "undefined")
            window.location.href = '/booking';
    }, [shouldRedirect]);

    useEffect(() => {
        if (paymentUrl) {
            const handleMessage = (event: MessageEvent) => {
                if (event.data === 'PAYMENT_SUCCESS') {
                    setShouldRedirect(true);
                }
            };

            window.addEventListener('message', handleMessage);
            return () => window.removeEventListener('message', handleMessage);
        }
    }, [paymentUrl]);

    useEffect(() => {
        setBooking(bookingResponse.newBooking);
        setPaymentUrl(bookingResponse.paymentUrl);
        setLoading(false);
    }, [bookingResponse]);

    const fetchTrip = useCallback(async () => {
        const trips = [];
        if (booking) {
            for (const tripId of booking.trips) {
                try {
                    const trip = await getPersonalTripById(tripId);
                    trips.push(trip);
                } catch (error: unknown) {
                    setError(error.message || "Lỗi không xác định");
                }
            }
        }
        setTrips(trips);
    }, [booking])

    useEffect(() => {
        fetchTrip();
    }, [booking, fetchTrip]);

    useEffect(() => {
        handlePayment()
    }, [paymentUrl]);



    const handlePayment = () => {
        setShowPaymentDialog(true);
    };

    const handleIframeLoad = () => {
        setIframeLoading(false);
    };

    const renderTripDetails = (trip: Trip) => {
        switch (trip.serviceType) {
            case ServiceType.BOOKING_HOUR:
                return (
                    <div className="mb-4 p-4 border rounded-lg">
                        <p>Thời gian: {(trip.servicePayload as BookingHourPayloadDto).bookingHour.totalTime} phút</p>
                        <p>Điểm đón: {(trip.servicePayload as BookingHourPayloadDto).bookingHour.startPoint.address}</p>
                    </div>
                );
            case ServiceType.BOOKING_SCENIC_ROUTE:
                return (
                    <div className="mb-4 p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Tour tham quan</h3>
                        <p>Tuyến đường: {(trip.servicePayload as BookingScenicRoutePayloadDto).bookingScenicRoute.routeId}</p>
                        <p>Khoảng cách: {(trip.servicePayload as BookingScenicRoutePayloadDto).bookingScenicRoute.distanceEstimate}km</p>
                    </div>
                );
            case ServiceType.BOOKING_DESTINATION:
                return (
                    <div className="mb-4 p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Điểm đến cố định</h3>
                        <p>Điểm đón: {(trip.servicePayload as BookingDestinationPayloadDto).bookingDestination.startPoint.address}</p>
                        <p>Điểm đến: {(trip.servicePayload as BookingDestinationPayloadDto).bookingDestination.endPoint.address}</p>
                    </div>
                );
            case ServiceType.BOOKING_SHARE:
                return (
                    <div className="mb-4 p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Đi chung xe</h3>
                        <p>Số chỗ: {(trip.servicePayload as BookingSharePayloadDto).bookingShare.numberOfSeat}</p>
                        <p>Điểm đến: {(trip.servicePayload as BookingSharePayloadDto).bookingShare.endPoint.address}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) return <div className="text-center py-8">Đang tải thông tin...</div>;
    if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
    if (!booking) return <div className="text-center py-8">Không tìm thấy thông tin đơn hàng</div>;

    return (
        <div className="flex justify-center p-4 max-w-full">
            <div className="w-full max-w-4xl bg-white shadow-md p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-center mb-6">Chi tiết đơn hàng #{booking.bookingCode}</h2>

                <div className="mb-6 border p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4">Thông tin thanh toán</h4>
                    <p><strong>Phương thức:</strong> {booking.paymentMethod ? booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1) : 'Chưa chọn'}</p>
                    <p><strong>Ngày tạo:</strong> {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('vi-VN') : 'Chưa có'}</p>
                    <p><strong>Trạng thái:</strong> {booking.status || 'Chưa có'}</p>
                </div>

                <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-4">Chi tiết các chuyến đi</h4>
                    {trips?.map((trip) => (
                        <div key={trip._id} className="mb-4">
                            {renderTripDetails(trip)}
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-center">
                    <h3 className="text-xl font-bold text-blue-600 mb-4">
                        Tổng tiền: {booking.totalAmount.toLocaleString('vi-VN')} VND
                    </h3>
                </div>
            </div>
            {showPaymentDialog &&
                <div className="relative min-h-[500px]">
                    {iframeLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                    <iframe
                        src={paymentUrl}
                        className="w-full h-[500px] border-0"
                        onLoad={handleIframeLoad}
                        title="Payment Gateway"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="payment *"
                    />
                </div>
            }

        </div>
    );
};


export default CheckoutPage;

