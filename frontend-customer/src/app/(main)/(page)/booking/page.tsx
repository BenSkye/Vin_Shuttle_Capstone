'use client';

import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Space } from 'antd';
import { IBooking } from '@/interface/booking';
import { BookingStatus } from '@/constants/booking.constants'
import { bookingStatusColor } from '@/constants/booking.constants';
import { getCustomerPersonalBooking } from '@/service/booking.service';
import { formatVndPrice } from '@/utils/price.until';
import Link from 'next/link';

const { Title } = Typography;

const BookingList: React.FC = () => {
    const [bookings, setBookings] = useState<IBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await getCustomerPersonalBooking();
            setBookings(response);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };


    const getLatestStatusDate = (statusHistory: IBooking['statusHistory']) => {
        if (!statusHistory || statusHistory.length === 0) return null;
        return new Date(statusHistory[statusHistory.length - 1].changedAt).toLocaleString();
    };

    const columns = [
        {
            title: 'Mã Đơn',
            dataIndex: 'bookingCode',
            key: 'bookingCode',
            render: (code: number, record: IBooking) => (
                <Link href={`/booking/${record._id}`}>{code}</Link>
            )
        },
        {
            title: 'Số Chuyến',
            dataIndex: 'trips',
            key: 'trips',
            render: (trips: string[]) => trips.length,
        },
        {
            title: 'Tổng Tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount: number) => formatVndPrice(amount),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: BookingStatus) => (
                <Tag color={bookingStatusColor[status]}>
                    {status.replace(/_/g, ' ')}
                </Tag>
            ),
        },
        {
            title: 'Cập Nhật Lần Cuối',
            key: 'lastUpdate',
            render: (_, record: IBooking) => getLatestStatusDate(record.statusHistory),
        }
    ];

    return (
        <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Title level={2}>Lịch Sử Đặt Xe</Title>
                <Table
                    columns={columns}
                    dataSource={bookings}
                    loading={loading}
                    rowKey="_id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} đơn đặt xe`,
                    }}
                />
            </Space>
        </Card>
    );
};

export default BookingList;
