// components/TripDetailsModal.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TripStatus, tripStatusColor, tripStatusText } from '~/constants/trip.enum';
import { ServiceType } from '~/constants/service-type.enum';
import { BookingDestinationPayloadDto, BookingHourPayloadDto, Rating } from '~/interface/trip';

interface TripDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    trip: Trip | null;
    tripRating: Rating | null;
    loadingRating: boolean;
}

export const TripDetailsModal = ({
    visible,
    onClose,
    trip,
    tripRating,
    loadingRating,
}: TripDetailsModalProps) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'HH:mm dd/MM/yyyy');
        } catch (e) {
            return 'Invalid date';
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const maxStars = 5;

        for (let i = 1; i <= maxStars; i++) {
            stars.push(
                <Icon
                    key={i}
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={20}
                    color={i <= rating ? '#FFD700' : '#D3D3D3'}
                    style={{ marginRight: 2 }}
                />
            );
        }

        return <View style={{ flexDirection: 'row', alignItems: 'center' }}>{stars}</View>;
    };

    const getStatusText = (status: string): string => {
        const statusLower = status.toLowerCase() as TripStatus;
        return tripStatusText[statusLower] || 'Không xác định';
    };

    if (!trip) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <View
                    style={{
                        backgroundColor: 'white',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 20,
                        maxHeight: '80%',
                    }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 15,
                        }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Chi tiết cuốc xe</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ maxHeight: '90%' }}>
                        {/* Customer Information */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>
                                Thông tin khách hàng
                            </Text>

                            <DetailRow label="Tên:" value={trip.customerId?.name || 'N/A'} />
                            <DetailRow label="SĐT:" value={trip.customerId?.phone || 'N/A'} />
                        </View>

                        {/* Trip Information */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>
                                Thông tin cuốc xe
                            </Text>

                            <DetailRow label="Mã chuyến:" value={trip._id} />
                            <DetailRow
                                label="Trạng thái:"
                                value={getStatusText(trip.status)}
                                valueStyle={{ color: trip.status === 'completed' ? 'green' : 'red' }}
                            />
                            <DetailRow
                                label="Loại dịch vụ:"
                                value={
                                    trip.serviceType === ServiceType.BOOKING_HOUR
                                        ? 'Đặt theo giờ'
                                        : trip.serviceType === ServiceType.BOOKING_DESTINATION
                                            ? 'Đặt theo điểm đến'
                                            : 'Khác'
                                }
                            />

                            {trip.serviceType === ServiceType.BOOKING_HOUR && (
                                <DetailRow
                                    label="Thời lượng:"
                                    value={`${(trip.servicePayload as BookingHourPayloadDto).bookingHour.totalTime} phút`}
                                />
                            )}

                            <DetailRow
                                label="Địa chỉ đón:"
                                value={
                                    trip.serviceType === ServiceType.BOOKING_HOUR
                                        ? (trip.servicePayload as BookingHourPayloadDto).bookingHour.startPoint.address
                                        : trip.serviceType === ServiceType.BOOKING_DESTINATION
                                            ? (trip.servicePayload as BookingDestinationPayloadDto)
                                                .bookingDestination.startPoint.address
                                            : 'N/A'
                                }
                            />

                            {trip.serviceType === ServiceType.BOOKING_DESTINATION && (
                                <DetailRow
                                    label="Địa chỉ đến:"
                                    value={
                                        (trip.servicePayload as BookingDestinationPayloadDto)
                                            .bookingDestination.endPoint.address
                                    }
                                />
                            )}
                        </View>

                        {/* Payment Information */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>
                                Thông tin thanh toán
                            </Text>
                            <DetailRow
                                label="Số tiền:"
                                value={
                                    <>
                                        {trip.amount?.toLocaleString('vi-VN') || '0'} VNĐ
                                        {trip.isPrepaid ? (
                                            <Text className="text-xs text-green-500 font-medium"> (Trả trước)</Text>
                                        ) : (trip.isPayed ? (
                                            <Text className="text-xs text-blue-500 font-medium"> (Trả sau - đã thanh toán)</Text>
                                        ) : (
                                            <Text className="text-xs text-orange-500 font-bold"> (Trả sau - tài xế thu)</Text>
                                        ))}
                                    </>
                                }
                                valueStyle={{ fontWeight: 'bold' }}
                            />
                        </View>

                        {/* Vehicle Information */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>
                                Thông tin phương tiện
                            </Text>

                            <DetailRow label="Tên xe:" value={trip.vehicleId?.name || 'N/A'} />
                            <DetailRow label="Biển số:" value={trip.vehicleId?.licensePlate || 'N/A'} />
                        </View>

                        {/* Rating Section */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>
                                Đánh giá từ khách hàng
                            </Text>

                            {loadingRating ? (
                                <View style={{ padding: 10, alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color="#2563eb" />
                                    <Text style={{ marginTop: 8, color: '#666' }}>Đang tải đánh giá...</Text>
                                </View>
                            ) : tripRating ? (
                                <>
                                    <DetailRow
                                        label="Điểm đánh giá:"
                                        value={
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {renderStars(tripRating.rate)}
                                                <Text style={{ marginLeft: 5, color: '#333' }}>
                                                    ({tripRating.rate}/5)
                                                </Text>
                                            </View>
                                        }
                                    />

                                    {tripRating.feedback && (
                                        <DetailRow label="Nhận xét:" value={tripRating.feedback} />
                                    )}

                                    <DetailRow
                                        label="Ngày đánh giá:"
                                        value={formatDate(tripRating.createdAt)}
                                    />
                                </>
                            ) : (
                                <View
                                    style={{
                                        padding: 15,
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: 8,
                                        alignItems: 'center',
                                    }}>
                                    <Icon name="star-off" size={24} color="#6b7280" />
                                    <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 8 }}>
                                        Chưa có đánh giá cho cuốc xe này
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// Helper component for detail rows
const DetailRow = ({
    label,
    value,
    valueStyle = {},
}: {
    label: string;
    value: React.ReactNode;
    valueStyle?: any;
}) => (
    <View
        style={{
            flexDirection: 'row',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
        }}>
        <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>{label}</Text>
        <Text style={[{ width: '70%', color: '#333' }, valueStyle]}>{value}</Text>
    </View>
);