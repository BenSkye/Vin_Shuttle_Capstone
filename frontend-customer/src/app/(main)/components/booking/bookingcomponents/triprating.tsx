'use client';

import { useState, useEffect } from 'react';
import { Rate, Input, Button, Typography, Avatar } from 'antd';
import { useRouter } from 'next/navigation';
import { getRateTrip, createRating } from '@/service/trip.service';
import { Trip } from '@/interface/trip';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaUserAlt, FaCar } from 'react-icons/fa';
import Swal from 'sweetalert2';

const { TextArea } = Input;
const { Text } = Typography;

const desc = ['Rất tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời'];

interface TripRatingProps {
    tripId: string;
    trip: Trip;
    existingRating?: {
        rate: number;
        feedback: string;
    } | null;
}

export default function TripRating({ tripId, trip, existingRating = null }: TripRatingProps) {
    const router = useRouter();
    const [rating, setRating] = useState<number>(existingRating?.rate || 5);
    const [comment, setComment] = useState<string>(existingRating?.feedback || '');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [hasRated, setHasRated] = useState<boolean>(!!existingRating);

    // Check for existing rating
    useEffect(() => {
        if (existingRating) {
            setRating(existingRating.rate);
            setComment(existingRating.feedback);
            setHasRated(true);
        }
    }, [existingRating]);

    const handleSubmit = async () => {
        if (hasRated) return;

        setSubmitting(true);
        try {
            const response = await createRating(tripId, rating, comment);
            console.log("rating", response);

            Swal.fire({
                title: 'Cảm ơn!',
                text: 'Cảm ơn bạn đã đánh giá!',
                icon: 'success',
                timer: 2000, // Tự động đóng sau 2 giây
                showConfirmButton: false
            });

            setHasRated(true);
            setTimeout(() => router.push('/trips'), 2000);
        } catch (error) {
            Swal.fire({
                title: 'Lỗi',
                text: error instanceof Error ? error.message : 'Không thể gửi đánh giá, vui lòng thử lại',
                icon: 'error',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // If there's no driver or vehicle info, return nothing
    if (!trip.driverId || !trip.vehicleId) {
        return (
            <div className="text-center p-6">
                <Text className="text-gray-600">
                    Không đủ thông tin để hiển thị đánh giá
                </Text>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full px-4 sm:px-0"
        >
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden transform hover:shadow-xl transition-all duration-300">
                {/* Header Section with Gradient Background */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-8 text-white">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                            {hasRated ? 'Đánh giá của bạn' : 'Đánh giá chuyến đi'}
                        </h2>
                        <p className="text-sm sm:text-base text-blue-100 opacity-90">
                            {hasRated
                                ? 'Cảm ơn bạn đã chia sẻ trải nghiệm của mình'
                                : 'Hãy chia sẻ trải nghiệm của bạn với chúng tôi'}
                        </p>
                    </motion.div>
                </div>

                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                    {/* Driver and Vehicle Info Card */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-50 rounded-xl p-4 sm:p-6 transform hover:scale-[1.02] transition-transform duration-300"
                    >
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-200 rounded-full blur-md transform -translate-y-1"></div>
                                <Avatar
                                    size={60}
                                    icon={<FaUserAlt className="text-xl" />}
                                    className="bg-gradient-to-r from-blue-400 to-blue-600 relative shadow-lg"
                                >
                                    {trip.driverId?.name?.[0]?.toUpperCase() || 'D'}
                                </Avatar>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                                    <FaUserAlt className="text-blue-500" />
                                    <Text className="text-base sm:text-lg font-semibold text-gray-800">
                                        {trip.driverId.name}
                                    </Text>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                                    <FaCar className="text-blue-500" />
                                    <Text className="text-sm sm:text-base text-gray-600">
                                        {trip.vehicleId.name} - {trip.vehicleId.licensePlate}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Rating Section */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center py-4 sm:py-8"
                    >
                        <div className="mb-4 sm:mb-6 transform hover:scale-105 transition-transform duration-300">
                            <Rate
                                tooltips={desc}
                                onChange={setRating}
                                value={rating}
                                disabled={hasRated}
                                character={<FaStar className="text-yellow-400" />}
                                className="text-2xl sm:text-4xl"
                            />
                        </div>
                        <AnimatePresence>
                            {rating > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-blue-600 font-medium text-sm sm:text-lg bg-blue-50 py-2 px-4 rounded-full inline-block"
                                >
                                    {desc[rating - 1]}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Comment Section */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="py-4"
                    >
                        <TextArea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ thêm về trải nghiệm của bạn (không bắt buộc)"
                            autoSize={{ minRows: 3, maxRows: 6 }}
                            className="w-full p-3 sm:p-4 border rounded-xl text-sm sm:text-base shadow-sm focus:ring-2 focus:ring-blue-500 transition-shadow duration-300"
                            disabled={hasRated}
                        />
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4"
                    >
                        <Button
                            onClick={() => router.back()}
                            className="h-10 sm:h-12 text-sm sm:text-base border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                        >
                            Quay lại
                        </Button>
                        {!hasRated && (
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                loading={submitting}
                                disabled={rating === 0}
                                className={`h-10 sm:h-12 text-sm sm:text-base rounded-xl transition-all duration-300
                                    ${rating === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5'
                                    }`}
                            >
                                Gửi đánh giá
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}