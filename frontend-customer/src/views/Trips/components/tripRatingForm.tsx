'use client'

import { useState } from 'react'

import { Button, Input, Rate, Typography } from 'antd'
import { motion } from 'framer-motion'
import { FaStar } from 'react-icons/fa'
import Swal from 'sweetalert2'

import { useCreateRatingMutation } from '@/hooks/queries/rating.query'

const { TextArea } = Input
const { Text } = Typography

const desc = ['Rất tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời']

interface TripRatingFormProps {
  tripId: string
  onSuccess?: () => void
}

export default function TripRatingForm({ tripId, onSuccess }: TripRatingFormProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const { mutate: createRating, isPending } = useCreateRatingMutation()

  const handleRatingChange = (value: number) => {
    console.log('Rating changed to:', value)
    setRating(value)
  }

  const handleSubmit = () => {
    createRating(
      { tripId, rate: rating, feedback: comment },
      {
        onSuccess: () => {
          Swal.fire({
            title: 'Cảm ơn!',
            text: 'Cảm ơn bạn đã đánh giá!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          })
          onSuccess?.()
        },
        onError: (error) => {
          Swal.fire({
            title: 'Lỗi',
            text: error instanceof Error ? error.message : 'Gửi đánh giá thất bại',
            icon: 'error',
          })
        },
      }
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-white p-6 shadow"
    >
      <h3 className="mb-4 text-xl font-bold text-gray-800">Đánh giá chuyến đi</h3>

      <div className="mb-4 flex flex-col items-center">
        <Rate
          tooltips={desc}
          onChange={handleRatingChange}
          value={rating}
          className="text-2xl sm:text-3xl"
        />
        {rating > 0 && <Text className="mt-2 text-blue-600">{desc[rating - 1]}</Text>}
      </div>

      <TextArea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
        autoSize={{ minRows: 3 }}
        className="mb-4"
      />

      <Button
        type="primary"
        onClick={handleSubmit}
        loading={isPending}
        disabled={rating === 0}
        block
      >
        Gửi đánh giá
      </Button>
    </motion.div>
  )
}
