'use client';

import { useState, useEffect } from 'react';
import { Rate, Spin, notification, Button, Modal, Input } from 'antd';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { IoCarSport } from 'react-icons/io5';
import { BsChatDots } from 'react-icons/bs';

import { ServiceType } from '@/constants/service-type.enum';
import { TripStatus } from '@/constants/trip.enum';

import RealTimeTripMap from '@/views/Trips/components/RealTimeTripMap';
import ScenicRealTimeTripMap from '@/views/Trips/components/ScenicRealTimeTripMap';
import DesRealTimeTripMap from '@/views/Trips/components/DesRealTimeTripMap';

import TripRatingForm from '@/views/Trips/components/tripRatingForm';
import TripRatingView from '@/views/Trips/components/tripRatingView';

import {
  BookingHourPayloadDto,
  BookingScenicRoutePayloadDto,
  BookingDestinationPayloadDto,
  Trip,
  BookingSharePayloadDto,
} from '@/interface/trip.interface';
import { cancelTrip } from '../../../service/trip.service';
import useTripSocket from '../../../hooks/useTripSocket';

export default function DetailTripPage({ id }: { id: string }) {
  const { data, isLoading, error, refetch } = useTripSocket(id as string);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleCancelTrip = async () => {
    if (!cancelReason.trim()) {
      notification.warning({
        message: 'Lý do hủy chuyến',
        description: 'Vui lòng nhập lý do hủy chuyến.',
      });
      return;
    }

    setIsCanceling(true);
    try {
      await cancelTrip(id, cancelReason);
      notification.success({
        message: 'Thành công',
        description: 'Chuyến đi đã được hủy thành công!',
      });
      setIsCancelModalVisible(false);

      // Refresh trip data to update status
      await refetch();
    } catch (error: any) {
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Không thể hủy chuyến đi. Vui lòng thử lại sau.',
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const showCancelModal = () => {
    setIsCancelModalVisible(true);
  };

  const hideCancelModal = () => {
    setIsCancelModalVisible(false);
    setCancelReason('');
  };

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spin size="large" tip="Đang tải chi tiết chuyến đi..." />
      </div>
    );

  if (error) {
    notification.error({
      message: 'Lỗi',
      description: error.message || 'Lỗi khi tải chi tiết chuyến đi',
    });
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-red-500">Có lỗi xảy ra khi tải dữ liệu chuyến đi</p>
      </div>
    );
  }

  if (!data)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-500">Không tìm thấy chuyến đi</p>
      </div>
    );

  const trip = data as Trip;

  const renderServiceDetails = (trip: Trip) => {
    const baseCardStyle =
      'bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300';
    const labelStyle = 'text-gray-600 font-medium text-sm sm:text-base';
    const valueStyle = 'text-gray-800 font-semibold text-base sm:text-lg';

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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="flex-shrink-0 text-lg text-blue-500 sm:text-xl" />
                    <p className={labelStyle}>Điểm đón</p>
                  </div>
                  <p className={`${valueStyle} sm:ml-auto`}>
                    {hourPayload.bookingHour.startPoint.address}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <FaClock className="flex-shrink-0 text-lg text-blue-500 sm:text-xl" />
                    <p className={labelStyle}>Thời gian bắt đầu</p>
                  </div>
                  <p className={`${valueStyle} sm:ml-auto`}>
                    {trip.timeStartEstimate
                      ? new Date(trip.timeStartEstimate).toLocaleString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : 'Chưa xác định'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <FaClock className="flex-shrink-0 text-lg text-blue-500 sm:text-xl" />
                    <p className={labelStyle}>Tổng thời gian</p>
                  </div>
                  <p className={`${valueStyle} sm:ml-auto`}>
                    {hourPayload.bookingHour.totalTime} phút
                  </p>
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
                    hourPayload.bookingHour.startPoint.position.lng,
                  ]}
                  vehicleId={trip.vehicleId._id}
                />
              </motion.div>
            )}
          </motion.div>
        );

      case ServiceType.BOOKING_SCENIC_ROUTE:
        const scenicPayload = trip.servicePayload as BookingScenicRoutePayloadDto;
        console.log(scenicPayload);
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={baseCardStyle}>
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="flex-shrink-0 text-lg text-blue-500 sm:text-xl" />
                    <p className={labelStyle}>Điểm đón</p>
                  </div>
                  <p className={`${valueStyle} sm:ml-auto`}>
                    {scenicPayload.bookingScenicRoute.startPoint.address}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <FaClock className="flex-shrink-0 text-lg text-blue-500 sm:text-xl" />
                    <p className={labelStyle}>Khoảng cách ước tính</p>
                  </div>
                  <p className={`${valueStyle} sm:ml-auto`}>
                    {scenicPayload.bookingScenicRoute.distanceEstimate} km
                  </p>
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
                <ScenicRealTimeTripMap
                  pickupLocation={[
                    scenicPayload.bookingScenicRoute.startPoint.position.lat,
                    scenicPayload.bookingScenicRoute.startPoint.position.lng,
                  ]}
                  vehicleId={trip.vehicleId._id}
                />
              </motion.div>
            )}
          </motion.div>
        );

      case ServiceType.BOOKING_DESTINATION:
        const destinationPayload = trip.servicePayload as BookingDestinationPayloadDto;
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={baseCardStyle}>
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="flex-shrink-0 text-lg text-blue-500 sm:text-xl" />
                    <p className={labelStyle}>Điểm đón</p>
                  </div>
                  <p className={`${valueStyle} sm:ml-auto`}>
                    {destinationPayload.bookingDestination.startPoint.address}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="flex-shrink-0 text-lg text-blue-500 sm:text-xl" />
                    <p className={labelStyle}>Điểm đến</p>
                  </div>
                  <p className={`${valueStyle} sm:ml-auto`}>
                    {destinationPayload.bookingDestination.endPoint.address}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <FaClock className="flex-shrink-0 text-lg text-blue-500 sm:text-xl" />
                    <p className={labelStyle}>Khoảng cách ước tính</p>
                  </div>
                  <p className={`${valueStyle} sm:ml-auto`}>
                    {destinationPayload.bookingDestination.distanceEstimate} km
                  </p>
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
                {(trip.status === TripStatus.PICKUP || trip.status === TripStatus.IN_PROGRESS) && (
                  <motion.div
                    className="mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {trip.status === TripStatus.PICKUP ? (
                      <RealTimeTripMap
                        pickupLocation={[
                          destinationPayload.bookingDestination.startPoint.position.lat,
                          destinationPayload.bookingDestination.startPoint.position.lng,
                        ]}
                        destinationLocation={[
                          destinationPayload.bookingDestination.endPoint.position.lat,
                          destinationPayload.bookingDestination.endPoint.position.lng,
                        ]}
                        vehicleId={trip.vehicleId._id}
                      />
                    ) : (
                      <DesRealTimeTripMap
                        pickupLocation={[
                          destinationPayload.bookingDestination.startPoint.position.lat,
                          destinationPayload.bookingDestination.startPoint.position.lng,
                        ]}
                        destinationLocation={[
                          destinationPayload.bookingDestination.endPoint.position.lat,
                          destinationPayload.bookingDestination.endPoint.position.lng,
                        ]}
                        vehicleId={trip.vehicleId._id}
                      />
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        );


      case ServiceType.BOOKING_SHARE:
        const bookingSharePayload = trip.servicePayload as BookingSharePayloadDto;
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={baseCardStyle}>
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="flex-shrink-0 text-lg text-blue-500 sm:text-xl" />
                    <p className={labelStyle}>Điểm đón</p>
                  </div>
                  <p className={`${valueStyle} sm:ml-auto`}>
                    {bookingSharePayload.bookingShare.startPoint.address}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="flex-shrink-0 text-lg text-blue-500 sm:text-xl" />
                    <p className={labelStyle}>Điểm đến</p>
                  </div>
                  <p className={`${valueStyle} sm:ml-auto`}>
                    {bookingSharePayload.bookingShare.endPoint.address}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-2">
                    <FaClock className="flex-shrink-0 text-lg text-blue-500 sm:text-xl" />
                    <p className={labelStyle}>Khoảng cách ước tính</p>
                  </div>
                  <p className={`${valueStyle} sm:ml-auto`}>
                    {bookingSharePayload.bookingShare.distanceEstimate} km
                  </p>
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
                    bookingSharePayload.bookingShare.startPoint.position.lat,
                    bookingSharePayload.bookingShare.startPoint.position.lng,
                  ]}
                  destinationLocation={[
                    bookingSharePayload.bookingShare.endPoint.position.lat,
                    bookingSharePayload.bookingShare.endPoint.position.lng,
                  ]}
                  vehicleId={trip.vehicleId._id}
                />
              </motion.div>
            )}
          </motion.div>
        );

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
      case TripStatus.BOOKING:
        return 'Đang đặt';
      case TripStatus.PAYED:
        return 'Đã thanh toán';
      case TripStatus.PICKUP:
        return 'Đang đón';
      case TripStatus.IN_PROGRESS:
        return 'Đang trong chuyến đi';
      case TripStatus.COMPLETED:
        return 'Đã hoàn thành';
      case TripStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Get status badge style - updated to match trips list page
  const getStatusStyle = (status: string) => {
    switch (status) {
      case TripStatus.BOOKING:
        return 'bg-yellow-100 text-yellow-800';
      case TripStatus.PAYED:
        return 'bg-blue-100 text-blue-800';
      case TripStatus.PICKUP:
        return 'bg-orange-100 text-orange-800';
      case TripStatus.IN_PROGRESS:
        return 'bg-indigo-100 text-indigo-800';
      case TripStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TripStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to determine if the map should be shown
  const shouldShowMap = (status: string) => {
    return status === TripStatus.PICKUP || status === TripStatus.IN_PROGRESS;
  };

  // Helper to check if chat feature should be available
  const canChatWithDriver = (status: string) => {
    return status === TripStatus.PAYED || status === TripStatus.PICKUP || status === TripStatus.IN_PROGRESS;
  };

  return (
    <div className="min-h-screen py-6 sm:py-12">
      <motion.div
        className="container mx-auto max-w-4xl px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 rounded-xl bg-white p-4 shadow-lg sm:mb-8 sm:rounded-2xl sm:p-8 sm:shadow-xl">
          <div className="mb-6 flex flex-col items-start gap-4 sm:mb-8 sm:flex-row sm:items-center">
            <IoCarSport className="text-3xl text-blue-500 sm:text-4xl" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                {trip.vehicleId.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500 sm:text-base">
                Biển số: {trip.vehicleId.licensePlate}
              </p>
            </div>

            {/* Chat with driver button */}
            {canChatWithDriver(trip.status) && (
              <Link
                href={`/conversations`}
                className="ml-auto flex items-center gap-2 rounded bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
              >

                <span>Chat với tài xế</span>
              </Link>
            )}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6">
            <div className="rounded-lg bg-gray-50 p-4 sm:rounded-xl sm:p-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-700 sm:text-base">Tài xế</h3>
              <p className="text-lg font-bold text-gray-900 sm:text-xl">{trip.driverId.name}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 sm:rounded-xl sm:p-6">
              <h3 className="mb-2 text-sm font-semibold text-gray-700 sm:text-base">Trạng thái</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${getStatusStyle(trip.status)}`}
              >
                {getStatusText(trip.status)}
              </span>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-800 sm:mb-6 sm:text-2xl">
              Chi tiết lộ trình
            </h2>
            {renderServiceDetails(trip)}
          </div>

          {/* Real-time trip status info */}
          {shouldShowMap(trip.status) && (
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                  {trip.status === TripStatus.PICKUP ? 'Đang đón bạn' : 'Đang trong chuyến đi'}
                </h2>
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Cập nhật thời gian thực</span>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Trip Button */}
          {(trip.status === TripStatus.PAYED || trip.status === TripStatus.PICKUP) && (
            <div className="mt-6 flex justify-center">
              <Button
                type="primary"
                danger
                onClick={showCancelModal}
                className="bg-red-500 hover:bg-red-600"
              >
                Hủy chuyến
              </Button>
            </div>
          )}

          {/* Cancel Confirmation Modal */}
          <Modal
            title="Xác nhận hủy chuyến"
            open={isCancelModalVisible}
            onOk={handleCancelTrip}
            onCancel={hideCancelModal}
            okText={isCanceling ? 'Đang hủy...' : 'Xác nhận'}
            cancelText="Hủy"
            confirmLoading={isCanceling}
          >
            <p>Vui lòng nhập lý do hủy chuyến:</p>
            <Input.TextArea
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy chuyến..."
            />
          </Modal>

          {/* Rating Section */}
          {trip.status === TripStatus.COMPLETED && (
            <div className="mt-6 border-t border-gray-200 pt-6 sm:mt-8 sm:pt-8">
              {!trip.isRating && !ratingSubmitted ? (
                <TripRatingForm
                  tripId={id}
                  onSuccess={() => setRatingSubmitted(true)}
                />
              ) : (
                <TripRatingView tripId={trip._id} />
              )}
            </div>
          )}
          <Link
            href="/trips"
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 transition-colors duration-200 hover:text-blue-800 sm:mt-6 sm:text-base"
          >
            <span>←</span>
            <span className="hover:underline">Quay lại danh sách</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
