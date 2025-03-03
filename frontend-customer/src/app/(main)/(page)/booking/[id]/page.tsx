'use client';

import React, { useEffect, useState } from 'react';
import {
    Card,
    Typography,
    Descriptions,
    Timeline,
    Tag,
    Divider,
    List,
    Space
} from 'antd';
import { IBooking, } from '@/interface/booking';
import { bookingStatusColor } from '@/constants/booking.constants';
import { formatVndPrice } from '@/utils/price.until';
import { use } from 'react';
import { getCustomerPersonalBookingById } from '@/service/booking.service';
import Link from 'next/link';

const { Title, Text } = Typography;

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



    if (loading) return <Card loading={true} />;
    if (!booking) return <div>Không tìm thấy thông tin đặt xe</div>;

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2}>Chi Tiết Đơn Đặt Xe #{booking.bookingCode}</Title>

                <Descriptions bordered>
                    <Descriptions.Item label="Mã Đơn" span={3}>
                        {booking.bookingCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng Thái" span={3}>
                        <Tag color={bookingStatusColor[booking.status]}>
                            {booking.status.replace('_', ' ')}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số Chuyến" span={3}>
                        {booking.trips.length}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng Tiền" span={3}>
                        <Text strong>{formatVndPrice(booking.totalAmount)}</Text>
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Lịch Sử Trạng Thái</Divider>

                <Timeline
                    mode="left"
                    items={booking.statusHistory.map(history => ({
                        color: bookingStatusColor[history.status],
                        label: new Date(history.changedAt).toLocaleString(),
                        children: (
                            <Space direction="vertical">
                                <Text strong>{history.status.replace('_', ' ')}</Text>
                                {history.reason && <Text type="secondary">{history.reason}</Text>}
                            </Space>
                        )
                    }))}
                />

                <Divider orientation="left">Danh Sách Chuyến</Divider>

                <List
                    bordered
                    dataSource={booking.trips}
                    renderItem={(tripId, index) => (
                        <List.Item>
                            <Text>Chuyến {index + 1} - ID:
                                <Link href={`/trips/${tripId}`}>{tripId}</Link> </Text>
                        </List.Item>
                    )}
                />
            </Space>
        </Card>
    );
};

