'use client';

import { Spin, notification, Rate } from 'antd';
import useTripSocket from '@/hooks/useTripSocket';
import Link from 'next/link';
import { BookingDestinationPayloadDto, BookingHourPayloadDto, BookingScenicRoutePayloadDto, BookingSharePayloadDto, Trip } from '@/interface/trip';
import { use } from 'react';
import { ServiceType } from '@/constants/service-type.enum';
import RealTimeTripMap from '@/app/(main)/components/trip/RealTimeTripMap';
import { TripStatus } from '@/constants/trip.enum';
import { motion } from 'framer-motion';
import { IoCarSport } from 'react-icons/io5';
import { FaMapMarkerAlt, FaClock, FaRoute, FaStar } from 'react-icons/fa';
import { useState, useEffect } from 'react';

import TripRating from '@/app/(main)/components/booking/bookingcomponents/triprating';

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const id = use(params).id;
    console.log("Trip ID:", id);
    const { data, isLoading, error } = useTripSocket(id as string);

    const [rating, setRating] = useState<{ rate: number, feedback: string }>({ rate: 5, feedback: '' });
    const [loadingRating, setLoadingRating] = useState(false);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    // Extract rating info from trip data if it exists
    useEffect(() => {
        if (data && (data as Trip).rating) {
            const tripData = data as Trip;
            setRating({
                rate: tripData.rating.rate,
                feedback: tripData.rating.feedback || ''
            });
        }
    }, [data]);

    // Check if rating was submitted and update state
    const handleRatingSuccess = () => {
        setRatingSubmitted(true);
        notification.success({
            message: 'Thành công',
            description: 'Cảm ơn bạn đã đánh giá chuyến đi!'
        });
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Spin size="large" tip="Đang tải chi tiết chuyến đi..." />
        </div>
    );

    if (error) {
        notification.error({
            message: 'Lỗi',
            description: error.message || 'Lỗi khi tải chi tiết chuyến đi',
        });
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-red-500 text-xl">Có lỗi xảy ra khi tải dữ liệu chuyến đi</p>
            </div>
        );
    }

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 text-xl">Không tìm thấy chuyến đi</p>
        </div>
    );

    const trip = data as Trip;

    const renderServiceDetails = (trip: Trip) => {
        const baseCardStyle = "bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300";
        const labelStyle = "text-gray-600 font-medium text-sm sm:text-base";
        const valueStyle = "text-gray-800 font-semibold text-base sm:text-lg";

        switch (trip.serviceType) {
            case ServiceType.BOOKING_HOUR:
                const hourPayload = trip.servicePayload as BookingHourPayloadDto;
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className={baseCardStyle}>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-blue-500 text-lg sm:text-xl flex-shrink-0" />
                                        <p className={labelStyle}>Điểm đón</p>
                                    </div>
                                    <p className={`${valueStyle} sm:ml-auto`}>{hourPayload.bookingHour.startPoint.address}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <div className="flex items-center gap-2">
                                        <FaClock className="text-blue-500 text-lg sm:text-xl flex-shrink-0" />
                                        <p className={labelStyle}>Tổng thời gian</p>
                                    </div>
                                    <p className={`${valueStyle} sm:ml-auto`}>{hourPayload.bookingHour.totalTime} giờ</p>
                                </div>
                            </div>
                        </div>

                        {(trip.status === TripStatus.PICKUP || trip.status === TripStatus.IN_PROGRESS) && (
                            <motion.div
                                className="mt-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <RealTimeTripMap
                                    pickupLocation={[
                                        hourPayload.bookingHour.startPoint.position.lat,
                                        hourPayload.bookingHour.startPoint.position.lng
                                    ]}
                                    vehicleId={trip.vehicleId._id}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                );

            // Add other service type cases here

            default:
                return (
                    <div className={baseCardStyle}>
                        <p className="text-gray-500">Loại dịch vụ không xác định</p>
                    </div>
                );
        }
    };

    // Helper to translate trip status to Vietnamese - updated to match trips list page
    const getStatusText = (status: string) => {
        switch (status) {
            case TripStatus.BOOKING: return 'Đang đặt';
            case TripStatus.PAYED: return 'Đã thanh toán';
            case TripStatus.PICKUP: return 'Đang đón';
            case TripStatus.IN_PROGRESS: return 'Đang trong chuyến đi';
            case TripStatus.COMPLETED: return 'Đã hoàn thành';
            case TripStatus.CANCELLED: return 'Đã hủy';
            default: return status;
        }
    };

    // Get status badge style - updated to match trips list page
    const getStatusStyle = (status: string) => {
        switch (status) {
            case TripStatus.BOOKING: return 'bg-yellow-100 text-yellow-800';
            case TripStatus.PAYED: return 'bg-blue-100 text-blue-800';
            case TripStatus.PICKUP: return 'bg-orange-100 text-orange-800';
            case TripStatus.IN_PROGRESS: return 'bg-indigo-100 text-indigo-800';
            case TripStatus.COMPLETED: return 'bg-green-100 text-green-800';
            case TripStatus.CANCELLED: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen py-6 sm:py-12">
            <motion.div
                className="container mx-auto px-4 max-w-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-8 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
                        <IoCarSport className="text-3xl sm:text-4xl text-blue-500" />
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                                {trip.vehicleId.name}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 mt-1">
                                Biển số: {trip.vehicleId.licensePlate}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                            <h3 className="font-semibold text-gray-700 text-sm sm:text-base mb-2">Tài xế</h3>
                            <p className="text-lg sm:text-xl font-bold text-gray-900">
                                {trip.driverId.name}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                            <h3 className="font-semibold text-gray-700 text-sm sm:text-base mb-2">Trạng thái</h3>
                            <span className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${getStatusStyle(trip.status)}`}>
                                {getStatusText(trip.status)}
                            </span>
                        </div>
                    </div>

                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Chi tiết lộ trình</h2>
                        {renderServiceDetails(trip)}
                    </div>

                    {/* Rating Section */}
                    {trip.status === TripStatus.COMPLETED && !trip.isRating && !ratingSubmitted && (
                        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                            <TripRating
                                tripId={id}
                                trip={trip}
                                existingRating={null}
                                onRatingSuccess={handleRatingSuccess}
                            />
                        </div>
                    )}

                    {(trip.status === TripStatus.COMPLETED && (trip.isRating || ratingSubmitted)) && trip.rating && (
                        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Đánh giá của bạn</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <FaStar className="text-yellow-500" />
                                    <span className="font-medium text-gray-700">Số sao:</span>
                                    <Rate disabled value={trip.rating.rate} />
                                    <span className="text-gray-700 ml-2">({trip.rating.rate}/5)</span>
                                </div>

                                {trip.rating.feedback && (
                                    <div className="mt-3">
                                        <span className="font-medium text-gray-700">Nhận xét:</span>
                                        <p className="bg-white p-3 rounded-md border mt-2 text-gray-700">{trip.rating.feedback}</p>
                                    </div>
                                )}

                                <div className="mt-4 text-gray-500 text-sm">
                                    <p>Cảm ơn bạn đã đánh giá chuyến đi!</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <Link
                        href="/trips"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 mt-4 sm:mt-6 text-sm sm:text-base"
                    >
                        <span>←</span>
                        <span className="hover:underline">Quay lại danh sách</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}