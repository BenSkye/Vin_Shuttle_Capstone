// components/TripCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { tripStatusText, TripStatus } from '~/constants/trip.enum';
import { Trip } from '~/interface/trip';


interface TripCardProps {
    trip: Trip;
    onPress: () => void;
}

export const TripCard = ({ trip, onPress }: TripCardProps) => {
    const getStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        let bgColor, textColor, iconName;

        if (statusLower === 'completed') {
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            iconName = 'check-circle';
        } else {
            // cancelled
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            iconName = 'close-circle';
        }

        return (
            <View className={`flex-row items-center rounded-full px-3 py-1 ${bgColor}`}>
                <Icon name={iconName} size={14} className={textColor} />
                <Text className={`${textColor} ml-1 text-xs font-medium`}>{getStatusText(status)}</Text>
            </View>
        );
    };

    const getStatusText = (status: string): string => {
        const statusLower = status.toLowerCase() as TripStatus;
        return tripStatusText[statusLower] || 'Không xác định';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <View className="p-4">
                <View className="mb-3 flex-row items-center justify-between">
                    <Text className="font-bold text-gray-800">{trip.code || 'Mã cuốc xe'}</Text>
                    {getStatusBadge(trip.status)}
                </View>

                <View className="mb-3 flex-row items-center justify-between">
                    <Text className="font-bold text-gray-800">{trip.customerId?.name || 'Khách hàng'}</Text>
                    {/* {getStatusBadge(trip.status)} */}
                </View>
                {trip.status === TripStatus.COMPLETED && (
                    <View className="mb-2 flex-row items-center">
                        <Icon name="clock-time-eight-outline" size={16} color="#4b5563" />
                        <Text className="ml-2 text-sm text-gray-600">
                            {trip.timeStart ? new Date(trip.timeStart).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : 'N/A'}
                        </Text>
                    </View>
                )}


                <View className="mb-2 flex-row items-center">
                    <Icon name="car" size={16} color="#4b5563" />
                    <Text className="ml-2 text-sm text-gray-600">
                        {trip.vehicleId?.name || 'N/A'} ({trip.vehicleId?.licensePlate || 'N/A'})
                    </Text>
                </View>

                <View className="mt-2 flex-row justify-between border-t border-gray-100 pt-2">
                    <View className="flex-row items-center">
                        <Icon name="currency-usd" size={16} color="#4b5563" />
                        <Text className="ml-1 font-medium text-gray-700">
                            {trip.amount?.toLocaleString('vi-VN') || '0'} VNĐ
                            {trip.isPrepaid ? (
                                <Text className="text-xs text-green-500 font-medium"> (Trả trước)</Text>
                            ) : (trip.isPayed ? (
                                <Text className="text-xs text-blue-500 font-medium"> (Trả sau - đã thanh toán)</Text>
                            ) : (
                                <Text className="text-xs text-orange-500 font-bold"> (Trả sau - tài xế thu)</Text>
                            ))}
                        </Text>
                    </View>
                    <Text className="text-sm text-blue-600">Xem chi tiết</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};