import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { getPersonalTrips, Trip } from '../services/tripServices';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TripStatus, tripStatusColor, tripStatusText } from '~/constants/trip.enum';

export default function TripHistoryScreen({ navigation }: { navigation: any }) {
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

  const handleNavigate = (status: TripStatus, vehicleId: string) => {
    if (status === TripStatus.PICKUP || status === TripStatus.IN_PROGRESS) {
      navigation.navigate('TripTracking', { vehicleId: vehicleId })
    }
  }



  const getStatusText = (status: TripStatus): string => {
    return tripStatusText[status] || 'Không xác định';
  };

  const getStatusColor = (status: TripStatus): string => {
    const color = tripStatusColor[status];
    switch (color) {
      case 'gold':
        return 'text-yellow-500';
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIconColor = (status: TripStatus): string => {
    const color = tripStatusColor[status];
    switch (color) {
      case 'gold':
        return '#d97706'; // amber-600
      case 'blue':
        return '#2563eb'; // blue-600
      case 'green':
        return '#16a34a'; // green-600
      case 'red':
        return '#dc2626'; // red-600
      default:
        return '#4b5563'; // gray-600
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
              <TouchableOpacity
                key={trip._id}
                onPress={() => handleNavigate((trip.status as TripStatus), trip.vehicleId._id)}
                className="mt-2 p-2 bg-blue-500 rounded-md"
              >
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
              </TouchableOpacity>
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