'use client'

import { useEffect, useState } from 'react'

import { Avatar, Button, Input, Rate, Typography } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FaCar, FaStar, FaUserAlt } from 'react-icons/fa'
import Swal from 'sweetalert2'

import { Trip } from '@/interface/trip'
import { createRating, getRateTrip } from '@/service/trip.service'

const { TextArea } = Input
const { Text } = Typography

const desc = ['Rất tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời']

interface TripRatingProps {
  tripId: string
  trip: Trip
  existingRating?: {
    rate: number
    feedback: string
  } | null
}

export default function TripRating({ tripId, trip, existingRating = null }: TripRatingProps) {
  const router = useRouter()
  const [rating, setRating] = useState<number>(existingRating?.rate || 5)
  const [comment, setComment] = useState<string>(existingRating?.feedback || '')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [hasRated, setHasRated] = useState<boolean>(!!existingRating)

  // Check for existing rating
  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rate)
      setComment(existingRating.feedback)
      setHasRated(true)
    }
  }, [existingRating])

  const handleSubmit = async () => {
    if (hasRated) return

    setSubmitting(true)
    try {
      const response = await createRating(tripId, rating, comment)
      console.log('rating', response)

      Swal.fire({
        title: 'Cảm ơn!',
        text: 'Cảm ơn bạn đã đánh giá!',
        icon: 'success',
        timer: 2000, // Tự động đóng sau 2 giây
        showConfirmButton: false,
      })

      setHasRated(true)
      setTimeout(() => router.push('/trips'), 2000)
    } catch (error) {
      Swal.fire({
        title: 'Lỗi',
        text: error instanceof Error ? error.message : 'Không thể gửi đánh giá, vui lòng thử lại',
        icon: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // If there's no driver or vehicle info, return nothing
  if (!trip.driverId || !trip.vehicleId) {
    return (
      <div className="p-6 text-center">
        <Text className="text-gray-600">Không đủ thông tin để hiển thị đánh giá</Text>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 sm:px-0"
    >
      <div className="mx-auto max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* Header Section with Gradient Background */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white sm:p-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
              {hasRated ? 'Đánh giá của bạn' : 'Đánh giá chuyến đi'}
            </h2>
            <p className="text-sm text-blue-100 opacity-90 sm:text-base">
              {hasRated
                ? 'Cảm ơn bạn đã chia sẻ trải nghiệm của mình'
                : 'Hãy chia sẻ trải nghiệm của bạn với chúng tôi'}
            </p>
          </motion.div>
        </div>

        <div className="space-y-6 p-4 sm:space-y-8 sm:p-8">
          {/* Driver and Vehicle Info Card */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="transform rounded-xl bg-gray-50 p-4 transition-transform duration-300 hover:scale-[1.02] sm:p-6"
          >
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
              <div className="relative">
                <div className="absolute inset-0 -translate-y-1 transform rounded-full bg-blue-200 blur-md"></div>
                <Avatar
                  size={60}
                  icon={<FaUserAlt className="text-xl" />}
                  className="relative bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg"
                >
                  {trip.driverId?.name?.[0]?.toUpperCase() || 'D'}
                </Avatar>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="mb-2 flex flex-col items-center space-y-2 sm:flex-row sm:items-start sm:space-x-2 sm:space-y-0">
                  <FaUserAlt className="text-blue-500" />
                  <Text className="text-base font-semibold text-gray-800 sm:text-lg">
                    {trip.driverId.name}
                  </Text>
                </div>
                <div className="flex flex-col items-center space-y-2 sm:flex-row sm:items-start sm:space-x-2 sm:space-y-0">
                  <FaCar className="text-blue-500" />
                  <Text className="text-sm text-gray-600 sm:text-base">
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
            className="py-4 text-center sm:py-8"
          >
            <div className="mb-4 transform transition-transform duration-300 hover:scale-105 sm:mb-6">
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
                  className="inline-block rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 sm:text-lg"
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
              className="w-full rounded-xl border p-3 text-sm shadow-sm transition-shadow duration-300 focus:ring-2 focus:ring-blue-500 sm:p-4 sm:text-base"
              disabled={hasRated}
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col space-y-3 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"
          >
            <Button
              onClick={() => router.back()}
              className="h-10 rounded-xl border-gray-300 text-sm transition-colors duration-300 hover:bg-gray-50 sm:h-12 sm:text-base"
            >
              Quay lại
            </Button>
            {!hasRated && (
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitting}
                disabled={rating === 0}
                className={`h-10 rounded-xl text-sm transition-all duration-300 sm:h-12 sm:text-base ${
                  rating === 0
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'transform bg-blue-500 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg'
                }`}
              >
                Gửi đánh giá
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
