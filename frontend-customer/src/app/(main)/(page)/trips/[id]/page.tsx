'use client';
import { Spin, notification } from 'antd';
import useTripSocket from '@/hooks/useTripSocket';
import Link from 'next/link';
import { BookingDestinationPayloadDto, BookingHourPayloadDto, BookingScenicRoutePayloadDto, BookingSharePayloadDto, Trip } from '@/interface/trip';
import { use } from 'react';
import { ServiceType } from '@/constants/service-type.enum';
import RealTimeTripMap from '@/app/(main)/components/trip/RealTimeTripMap';
import { TripStatus } from '@/constants/trip.enum';

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const id = use(params).id;

    const { data, isLoading, error } = useTripSocket(id as string);

    if (isLoading) return <Spin tip="Đang tải chi tiết chuyến đi..." />;
    if (error)
        notification.error({
            message: 'Lỗi',
            description: error.message || 'Lỗi khi tải chi tiết chuyến đi',
        });
    if (!data) return <p>Không tìm thấy chuyến đi</p>;


    const renderServiceDetails = (trip: Trip) => {
        switch (trip.serviceType) {
            case ServiceType.BOOKING_HOUR:
                const hourPayload = trip.servicePayload as BookingHourPayloadDto;
                return (
                    <>
                        <div className="space-y-2">
                            <p>Điểm đón: {hourPayload.bookingHour.startPoint.address}</p>
                            <p>Tổng thời gian: {hourPayload.bookingHour.totalTime} giờ</p>
                        </div>
                        {trip.status === TripStatus.PICKUP || trip.status === TripStatus.IN_PROGRESS ? (
                            <div className="space-y-4">
                                <RealTimeTripMap
                                    pickupLocation={[
                                        hourPayload.bookingHour.startPoint.lat,
                                        hourPayload.bookingHour.startPoint.lng
                                    ]}
                                    vehicleId={trip.vehicleId._id}
                                />
                            </div>
                        ) : (
                            <></>
                        )}
                    </>
                );
            case ServiceType.BOOKING_SCENIC_ROUTE:
                const scenicPayload = trip.servicePayload as BookingScenicRoutePayloadDto;
                return (
                    <div className="space-y-2">
                        <p>Điểm đón: {scenicPayload.bookingScenicRoute.startPoint.address}</p>
                        <p>Tuyến đường: {scenicPayload.bookingScenicRoute.routeId}</p>
                        <p>Khoảng cách ước tính: {scenicPayload.bookingScenicRoute.distanceEstimate} km</p>
                        <p>Khoảng cách thực tế: {scenicPayload.bookingScenicRoute.distance} km</p>
                    </div>
                );
            case ServiceType.BOOKING_DESTINATION:
                const destinationPayload = trip.servicePayload as BookingDestinationPayloadDto;
                return (
                    <div className="space-y-2">
                        <p>Điểm đón: {destinationPayload.bookingDestination.startPoint.address}</p>
                        <p>Điểm đến: {destinationPayload.bookingDestination.endPoint.address}</p>
                        <p>Khoảng cách ước tính: {destinationPayload.bookingDestination.distanceEstimate} km</p>
                        <p>Khoảng cách thực tế: {destinationPayload.bookingDestination.distance} km</p>
                    </div>
                );
            case ServiceType.BOOKING_SHARE:
                const sharePayload = trip.servicePayload as BookingSharePayloadDto;
                return (
                    <div className="space-y-2">
                        <p>Điểm đón: {sharePayload.bookingShare.startPoint.address}</p>
                        <p>Điểm đến: {sharePayload.bookingShare.endPoint.address}</p>
                        <p>Số ghế: {sharePayload.bookingShare.numberOfSeat}</p>
                        <p>Khoảng cách ước tính: {sharePayload.bookingShare.distanceEstimate} km</p>
                        <p>Khoảng cách thực tế: {sharePayload.bookingShare.distance} km</p>
                    </div>
                );
            default:
                return <p>Loại dịch vụ không xác định</p>;
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Tài xế: {(data as Trip).driverId.name}</h1>
                <h1 className="text-3xl font-bold mb-6">Xe: {(data as Trip).vehicleId.name}</h1>
                <h1 className="text-3xl font-bold mb-6">Biển số: {(data as Trip).vehicleId.licensePlate}</h1>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <h3 className="font-semibold">Trạng thái</h3>
                            <p
                                className={
                                    (data as Trip).status === 'completed' ? 'text-green-600' : 'text-blue-600'
                                }
                            >
                                {(data as Trip).status}
                            </p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-3">Chi tiết lộ trình</h2>
                        {renderServiceDetails(data as Trip)}
                    </div>

                    <Link href="/trips" className="text-blue-600 hover:underline">
                        ← Quay lại danh sách
                    </Link>
                </div>
            </div>
        </div>
    );
}
