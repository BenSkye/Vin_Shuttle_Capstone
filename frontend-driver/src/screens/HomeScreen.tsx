import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPersonalTrips, pickUp, Trip } from '../services/tripServices';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TripStatus, tripStatusColor, tripStatusText } from '~/constants/trip.enum';
import { ServiceType } from '~/constants/service-type.enum';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveTrips = async () => {
    try {
      setLoading(true);
      const allTrips = await getPersonalTrips();
      
      // Filter only active trips - booking, payed, pickup, in_progress
      const filteredTrips = allTrips.filter(
        trip => ['booking', 'payed', 'pickup', 'in_progress'].includes(trip.status.toLowerCase())
      );
      
      // Sort by status priority (in_progress first, then pickup, then payed, then booking)
      filteredTrips.sort((a, b) => {
        const statusPriority = {
          'in_progress': 1,
          'pickup': 2,
          'payed': 3,
          'booking': 4
        };
        return statusPriority[a.status.toLowerCase()] - statusPriority[b.status.toLowerCase()];
      });
      
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
    
    // Refresh when returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      fetchActiveTrips();
    });

    return unsubscribe;
  }, [navigation]);

  const handleNavigateToTrip = (trip: Trip) => {
    const status = trip.status.toLowerCase();
    
    // Only allow navigation to tracking for pickup and in_progress
    if (status === 'pickup' || status === 'in_progress') {
      navigation.navigate('TripTracking', { trip: trip });
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

  const getStatusColor = (status: string): string => {
    const statusKey = status.toLowerCase() as TripStatus;
    const color = tripStatusColor[statusKey];
    
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
  
  const getStatusIndicator = (status: string): JSX.Element => {
    const statusLower = status.toLowerCase();
    
    return (
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center',
        backgroundColor: statusLower === 'in_progress' ? '#F44336' : 
                          statusLower === 'pickup' ? '#4CAF50' : 
                          statusLower === 'payed' ? '#2196F3' : '#FFC107',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
      }}>
        <Icon 
          name={
            statusLower === 'in_progress' ? 'car-arrow-right' : 
            statusLower === 'pickup' ? 'account-arrow-up' : 
            statusLower === 'payed' ? 'cash-check' : 'calendar-clock'
          } 
          size={14} 
          color="white" 
        />
        <Text style={{ marginLeft: 4, color: 'white', fontWeight: '500', fontSize: 12 }}>
          {tripStatusText[statusLower as TripStatus] || status}
        </Text>
      </View>
    );
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
            activeTrips.map((trip) => {
              const canTrack = ['pickup', 'in_progress'].includes(trip.status.toLowerCase());
              const canPickup = trip.status.toLowerCase() === 'payed';
              
              return (
                <View
                  key={trip._id}
                  className={`mb-4 ${canTrack ? 'border-l-4 border-l-blue-500' : ''}`}
                >
                  <TouchableOpacity
                    onPress={() => canTrack ? handleNavigateToTrip(trip) : null}
                    className="p-4 bg-white rounded-lg shadow-md border border-gray-100"
                    disabled={!canTrack}
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="flex-row items-center">
                        <Icon name="account" size={20} color="#4b5563" />
                        <Text className="font-semibold ml-2">{trip.customerId.name}</Text>
                      </View>
                      {getStatusIndicator(trip.status)}
                    </View>

                    {/* Trip info rows */}
                    <View className="flex-row items-center mb-2">
                      <Icon name="clock" size={20} color="#4b5563" />
                      <Text className="ml-2">
                        {trip.timeStartEstimate ? 
                          format(new Date(trip.timeStartEstimate), 'HH:mm dd/MM/yyyy') : 
                          'Thời gian chưa xác định'}
                      </Text>
                    </View>

                    <View className="flex-row items-center mb-2">
                      <Icon name="car" size={20} color="#4b5563" />
                      <Text className="ml-2">
                        {trip.vehicleId.name} ({trip.vehicleId.licensePlate})
                      </Text>
                    </View>

                    <View className="flex-row items-center mb-2">
                      <Icon name="map-marker" size={20} color="#4b5563" />
                      <Text className="ml-2 flex-1" numberOfLines={1}>
                        {trip.serviceType === ServiceType.BOOKING_HOUR ? 
                          `Thuê theo giờ (${trip.servicePayload.bookingHour.totalTime} phút)` : 
                          'Chuyến đi theo điểm đến'}
                      </Text>
                    </View>

                    <View className="flex-row items-center mb-2">
                      <Icon name="cash" size={20} color="#4b5563" />
                      <Text className="ml-2">
                        {trip.amount ? `${trip.amount.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}
                      </Text>
                    </View>

                    {/* Action buttons based on status */}
                    {canPickup && (
                      <TouchableOpacity
                        onPress={() => handlePickup(trip._id)}
                        className="mt-2 bg-green-500 rounded-md py-2 px-4"
                      >
                        <View className="flex-row items-center justify-center">
                          <Icon name="car-pickup" size={20} color="white" />
                          <Text className="text-white font-medium ml-2">Đón khách</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    
                    {canTrack && (
                      <TouchableOpacity
                        onPress={() => handleNavigateToTrip(trip)}
                        className="mt-2 bg-blue-500 rounded-md py-2 px-4"
                      >
                        <View className="flex-row items-center justify-center">
                          <Icon name="map-marker-path" size={20} color="white" />
                          <Text className="text-white font-medium ml-2">Xem chuyến đi</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View className="flex-row items-center justify-center p-8 bg-white rounded-lg shadow-sm">
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