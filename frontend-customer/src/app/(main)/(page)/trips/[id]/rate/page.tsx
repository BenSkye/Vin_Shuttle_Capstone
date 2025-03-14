'use client';

import { useState, useEffect } from 'react';
import { Rate, Input, Button, Card, Typography, notification, Avatar } from 'antd';
import { useRouter } from 'next/navigation';
import { getPersonalTripById, getRateTrip, createRating } from '@/service/trip.service';
import { Trip } from '@/interface/trip';
import { TripStatus } from '@/constants/trip.enum';

const { TextArea } = Input;
const { Title, Text } = Typography;

const desc = ['Rất tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời'];

export default function TripRatingPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [hasRated, setHasRated] = useState<boolean>(false);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const data = await getPersonalTripById(params.id);
                if (data.status !== TripStatus.COMPLETED) {
                    notification.error({
                        message: 'Không thể đánh giá',
                        description: 'Chỉ có thể đánh giá chuyến đi đã hoàn thành'
                    });
                    router.push(`/trips/${params.id}`);
                    return;
                }
                setTrip(data);

                // Check if trip is already rated
                const ratingData = await getRateTrip(params.id);
                if (ratingData) {
                    setHasRated(true);
                    setRating(ratingData.rate);
                    setComment(ratingData.feedback || '');
                    notification.info({
                        message: 'Thông báo',
                        description: 'Bạn đã đánh giá chuyến đi này trước đó'
                    });
                    router.push(`/trips/${params.id}`);
                }
            } catch (error) {
                notification.error({
                    message: 'Lỗi',
                    description: error instanceof Error ? error.message : 'Không thể tải thông tin chuyến đi'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTrip();
    }, [params.id, router]);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await createRating(params.id, rating, comment);
            notification.success({
                message: 'Thành công',
                description: 'Cảm ơn bạn đã đánh giá chuyến đi!'
            });
            router.push(`/trips/${params.id}`);
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: error instanceof Error ? error.message : 'Không thể gửi đánh giá, vui lòng thử lại'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Text>Không tìm thấy thông tin chuyến đi</Text>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Card className="shadow-lg rounded-lg overflow-hidden">
                    <div className="text-center mb-8">
                        <Title level={2} className="mb-2">Đánh giá chuyến đi</Title>
                        <Text className="text-gray-500">Hãy chia sẻ trải nghiệm của bạn với chúng tôi</Text>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-4 mb-4">
                                <Avatar size={64} className="bg-blue-500">{trip.driverId.name[0]}</Avatar>
                                <div>
                                    <Text className="block font-medium">Tài xế: {trip.driverId.name}</Text>
                                    <Text className="block text-gray-500">Xe: {trip.vehicleId.name} - {trip.vehicleId.licensePlate}</Text>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="mb-2">
                                <Rate
                                    tooltips={desc}
                                    onChange={setRating}
                                    value={rating}
                                    className="text-2xl"
                                />
                            </div>
                            {rating ? <Text className="text-blue-600">{desc[rating - 1]}</Text> : ''}
                        </div>

                        <div>
                            <TextArea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ thêm về trải nghiệm của bạn (không bắt buộc)"
                                autoSize={{ minRows: 4, maxRows: 8 }}
                                className="w-full p-3 border rounded-lg"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <Button 
                                onClick={() => router.back()} 
                                className="flex-1 h-12"
                            >
                                Quay lại
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                loading={submitting}
                                className="flex-1 h-12 bg-blue-500 hover:bg-blue-600"
                            >
                                Gửi đánh giá
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}