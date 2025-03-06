import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPersonalTrips, pickUp, Trip } from '../services/tripServices';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TripStatus, tripStatusColor, tripStatusText } from '~/constants/trip.enum';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveTrips = async () => {
    try {
      setLoading(true);
      const allTrips = await getPersonalTrips();
      const filteredTrips = allTrips.filter(
        trip => trip.status !== TripStatus.COMPLETED && trip.status !== TripStatus.CANCELLED
      );
      setActiveTrips(filteredTrips);
    } catch (error) {
      console.error('Error fetching active trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveTrips();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchActiveTrips();
  }, []);

  const handleNavigate = (status: TripStatus, vehicleId: string) => {
    if (status === TripStatus.PICKUP || status === TripStatus.IN_PROGRESS) {
      navigation.navigate('TripTracking', { vehicleId: vehicleId });
    }
  };

  const handlePickup = async (tripId: string) => {
    try {
      setLoading(true);
      await pickUp(tripId);
      // Refresh the trips list after successful pickup
      await fetchActiveTrips();
    } catch (error) {
      console.error('Error picking up customer:', error);
      // You might want to add error handling UI here
    } finally {
      setLoading(false);
    }
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
            <Icon name="car-clock" size={24} color="#1f2937" /> Chuyến đi hiện tại
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : activeTrips.length > 0 ? (
            activeTrips.map((trip) => (
              <TouchableOpacity
                key={trip._id}
                onPress={() => handleNavigate((trip.status as TripStatus), trip.vehicleId._id)}
                className="mb-4"
              >
                <View className="p-4 bg-white rounded-lg shadow-md border border-gray-100">
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <Icon name="account" size={20} color="#4b5563" />
                      <Text className="font-semibold ml-2">{trip.customerId.name}</Text>
                    </View>
                    <Text className={`font-medium ${getStatusColor(trip.status as TripStatus)}`}>
                      {tripStatusText[trip.status as TripStatus]}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Icon name="clock-start" size={20} color="#4b5563" />
                    <Text className="ml-2">
                      {format(new Date(trip.timeStartEstimate), 'HH:mm dd/MM/yyyy')}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Icon name="car" size={20} color="#4b5563" />
                    <Text className="ml-2">
                      {trip.vehicleId.name} ({trip.vehicleId.licensePlate})
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Icon name="cash" size={20} color="#4b5563" />
                    <Text className="ml-2">
                      {trip.amount.toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </View>

                  {/* Add Pickup Button for PAYED status */}
                  {trip.status === TripStatus.PAYED && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation(); // Prevent triggering parent TouchableOpacity
                        handlePickup(trip._id);
                      }}
                      className="mt-2 bg-green-500 rounded-md py-2 px-4"
                    >
                      <View className="flex-row items-center justify-center">
                        <Icon name="car-pickup" size={20} color="white" className="mr-2" />
                        <Text className="text-white font-medium">Đón khách</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex-row items-center justify-center p-4 bg-white rounded-lg shadow-sm">
              <Icon name="car-off" size={24} color="#6b7280" />
              <Text className="text-center text-gray-500 ml-2">
                Không có chuyến đi nào đang hoạt động
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}