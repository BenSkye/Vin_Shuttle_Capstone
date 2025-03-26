'use client'

import { Rate, Spin } from 'antd'
import { FaStar } from 'react-icons/fa'
import { useRatingByTripQuery } from '@/hooks/queries/rating.query'

interface TripRatingViewProps {
    tripId: string
}

export default function TripRatingView({ tripId }: TripRatingViewProps) {
    const { data: rating, isLoading, isError } = useRatingByTripQuery(tripId)

    if (isLoading) return <Spin tip="Đang tải đánh giá..." />
    if (isError) return <div className="text-red-500">Lỗi khi tải đánh giá</div>
    if (!rating) return null

    return (
        <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="mb-4 text-xl font-bold text-gray-800">Đánh giá của bạn</h3>
            <div className="mb-3 flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                <span className="font-medium text-gray-700">Số sao:</span>
                <Rate disabled value={rating.rate} character={<FaStar className="text-yellow-400" />} />
                <span className="ml-2 text-gray-700">({rating.rate}/5)</span>
            </div>

            {rating.feedback && (
                <div className="mt-3">
                    <span className="font-medium text-gray-700">Nhận xét:</span>
                    <p className="mt-2 rounded-md border bg-white p-3 text-gray-700">
                        {rating.feedback}
                    </p>
                </div>
            )}
        </div>
    )
}