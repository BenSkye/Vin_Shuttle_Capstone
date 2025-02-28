import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { getPersonalTrips, Trip } from '../services/tripServices';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TripHistoryScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await getPersonalTrips();
      setTrips(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'booking':
        return 'Đang đặt';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'payed':
        return 'Đã thanh toán';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'booking':
        return 'text-blue-600';
      case 'confirmed':
        return 'text-purple-600';
      case 'in_progress':
        return 'text-amber-500';
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'payed':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIconColor = (status: string): string => {
    switch (status) {
      case 'booking':
        return '#2563eb'; // blue
      case 'confirmed':
        return '#9333ea'; // purple
      case 'in_progress':
        return '#f59e0b'; // amber
      case 'completed':
        return '#16a34a'; // green
      case 'cancelled':
        return '#dc2626'; // red
      case 'payed':
        return '#16a34a'; // green
      default:
        return '#4b5563'; // gray
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          <Text className="text-xl font-bold mb-4 text-gray-800">
            <Icon name="history" size={24} color="#1f2937" /> Lịch sử chuyến đi
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : trips.length > 0 ? (
            trips.map((trip) => (
              <View 
                key={trip._id} 
                className="mb-4 p-4 bg-white rounded-lg shadow-md border border-gray-100"
              >
                <View className="flex-row items-center mb-2">
                  <Icon name="account" size={20} color="#4b5563" />
                  <Text className="font-semibold ml-2">Khách hàng: {trip.customerId.name}</Text>
                </View>
                
                <View className="flex-row items-center mb-2">
                  <Icon name="clock-start" size={20} color="#4b5563" />
                  <Text className="ml-2">Bắt đầu: {format(new Date(trip.timeStartEstimate), 'HH:mm dd/MM/yyyy')}</Text>
                </View>

                <View className="flex-row items-center mb-2">
                  <Icon name="clock-end" size={20} color="#4b5563" />
                  <Text className="ml-2">Kết thúc: {format(new Date(trip.timeEndEstimate), 'HH:mm dd/MM/yyyy')}</Text>
                </View>

                <View className="flex-row items-center mb-2">
                  <Icon name="car" size={20} color="#4b5563" />
                  <Text className="ml-2">Xe: {trip.vehicleId.name} ({trip.vehicleId.licensePlate})</Text>
                </View>

                <View className="flex-row items-center mb-2">
                  <Icon name="clipboard-list" size={20} color="#4b5563" />
                  <Text className="ml-2">Loại dịch vụ: {trip.serviceType === 'booking_hour' ? 'Đặt theo giờ' : 'Khác'}</Text>
                </View>

                {trip.serviceType === 'booking_hour' && (
                  <View className="flex-row items-center mb-2">
                    <Icon name="timer" size={20} color="#4b5563" />
                    <Text className="ml-2">Thời gian đặt: {trip.servicePayload.bookingHour.totalTime} phút</Text>
                  </View>
                )}

                <View className="flex-row items-center mb-2">
                  <Icon name="cash" size={20} color="#4b5563" />
                  <Text className="ml-2">Số tiền: {trip.amount.toLocaleString('vi-VN')} VNĐ</Text>
                </View>

                <View className="flex-row items-center">
                  <Icon name="information" size={20} color={getStatusIconColor(trip.status)} />
                  <Text className={`font-semibold ml-2 ${getStatusColor(trip.status)}`}>
                    Trạng thái: {getStatusText(trip.status)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className="flex-row items-center justify-center p-4">
              <Icon name="alert-circle-outline" size={24} color="#6b7280" />
              <Text className="text-center text-gray-500 ml-2">Không có chuyến đi nào</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
