'use client';
import React, { useEffect, useState } from 'react';
import { IBooking } from '@/interface/booking';
import { bookingStatusColor } from '@/constants/booking.constants';
import { formatVndPrice } from '@/utils/price.until';
import { use } from 'react';
import { getCustomerPersonalBookingById } from '@/service/booking.service';
import Link from 'next/link';

export default function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
    const id = use(params).id;
    const [booking, setBooking] = useState<IBooking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchBookingDetail(id);
    }, [id]);

    const fetchBookingDetail = async (bookingId: string) => {
        try {
            const response = await getCustomerPersonalBookingById(bookingId);
            setBooking(response);
        } catch (error) {
            console.error('Error fetching booking detail:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-700">Không tìm thấy thông tin đặt xe</h3>
                    <p className="text-gray-500 mt-2">Vui lòng kiểm tra lại mã đơn hàng</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Chi Tiết Đơn Đặt Xe #{booking.bookingCode}
                </h1>
            </div>

            {/* Booking Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500">Mã Đơn</p>
                        <p className="text-lg font-semibold">{booking.bookingCode}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500">Trạng Thái</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${bookingStatusColor[booking.status] === 'green' ? 'bg-green-100 text-green-800' :
                                bookingStatusColor[booking.status] === 'red' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                            }`}>
                            {booking.status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500">Số Chuyến</p>
                        <p className="text-lg font-semibold">{booking.trips.length}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500">Tổng Tiền</p>
                        <p className="text-lg font-semibold text-green-600">
                            {formatVndPrice(booking.totalAmount)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Lịch Sử Trạng Thái</h2>
                <div className="space-y-6">
                    {booking.statusHistory.map((history, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className={`w-4 h-4 rounded-full ${bookingStatusColor[history.status] === 'green' ? 'bg-green-500' :
                                        bookingStatusColor[history.status] === 'red' ? 'bg-red-500' :
                                            'bg-yellow-500'
                                    }`}></div>
                                {index !== booking.statusHistory.length - 1 && (
                                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">
                                    {new Date(history.changedAt).toLocaleString()}
                                </p>
                                <p className="font-medium mt-1">{history.status.replace('_', ' ')}</p>
                                {history.reason && (
                                    <p className="text-sm text-gray-600 mt-1">{history.reason}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trips List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Danh Sách Chuyến</h2>
                <div className="space-y-4">
                    {booking.trips.map((tripId, index) => (
                        <div key={tripId}
                            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <span className="text-gray-700">Chuyến {index + 1}</span>
                            <Link
                                href={`/trips/${tripId}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Xem chi tiết
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
