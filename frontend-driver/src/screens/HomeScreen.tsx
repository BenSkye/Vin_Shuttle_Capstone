//@ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPersonalTrips, pickUp, Trip } from '../services/tripServices';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TripStatus, tripStatusColor, tripStatusText } from '~/constants/trip.enum';
import { ServiceType } from '~/constants/service-type.enum';
import { useSchedule } from '~/context/ScheduleContext';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isInProgress } = useSchedule(); // Lấy trạng thái ca làm việc
  const [showCheckInWarning, setShowCheckInWarning] = useState(false);

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

  // Kiểm tra check-in trước khi thực hiện các hành động
  const handleActionWithCheckInValidation = (action: () => void) => {
    if (!isInProgress) {
      setShowCheckInWarning(true);
      return;
    }
    action();
  };

  const handleNavigateToTrip = (trip: Trip) => {
    const status = trip.status.toLowerCase();
    
    // Chỉ cho phép đi đến màn hình theo dõi cho trạng thái pickup và in_progress
    if (status === 'pickup' || status === 'in_progress') {
      handleActionWithCheckInValidation(() => {
        navigation.navigate('TripTracking', { trip: trip });
      });
    }
  };

  const handlePickup = async (tripId: string) => {
    handleActionWithCheckInValidation(async () => {
      try {
        setLoading(true);
        await pickUp(tripId);
        // Refresh danh sách chuyến đi sau khi đón khách thành công
        await fetchActiveTrips();
      } catch (error) {
        console.error('Error picking up customer:', error);
        Alert.alert('Lỗi', 'Không thể đón khách. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    });
  };

  // Get service type display
  const getServiceTypeInfo = (trip: Trip): { icon: string; label: string; details?: string } => {
    switch (trip.serviceType) {
      case ServiceType.BOOKING_HOUR:
        return {
          icon: "clock-time-four-outline",
          label: "Thuê theo giờ",
          details: `${trip.servicePayload.bookingHour?.totalTime || 0} phút`
        };
        
      case ServiceType.BOOKING_DESTINATION:
        return {
          icon: "map-marker-distance",
          label: "Đặt xe theo điểm đến",
          details: trip.servicePayload.bookingDestination?.distanceEstimate 
            ? `${(trip.servicePayload.bookingDestination.distanceEstimate / 1000).toFixed(1)} km` 
            : undefined
        };
        
      case ServiceType.BOOKING_SCENIC_ROUTE:
        return {
          icon: "routes",
          label: "Đặt xe theo tuyến cố định",
          details: trip.servicePayload.bookingScenicRoute?.distanceEstimate 
            ? `${(trip.servicePayload.bookingScenicRoute.distanceEstimate / 1000).toFixed(1)} km` 
            : undefined
        };
        
      case ServiceType.BOOKING_SHARE:
        return {
          icon: "account-group",
          label: "Đặt xe chia sẻ",
          details: `${trip.servicePayload.bookingShare?.numberOfSeat || 1} ghế`
        };
        
      default:
        return {
          icon: "car",
          label: "Đặt xe",
        };
    }
  };

  // Get start and end points based on service type
  const getLocationInfo = (trip: Trip): { startAddress: string; endAddress?: string } => {
    switch (trip.serviceType) {
      case ServiceType.BOOKING_HOUR:
        return {
          startAddress: trip.servicePayload.bookingHour?.startPoint?.address || "Không xác định"
        };
        
      case ServiceType.BOOKING_DESTINATION:
        return {
          startAddress: trip.servicePayload.bookingDestination?.startPoint?.address || "Không xác định",
          endAddress: trip.servicePayload.bookingDestination?.endPoint?.address || "Không xác định"
        };
        
      case ServiceType.BOOKING_SCENIC_ROUTE:
        return {
          startAddress: trip.servicePayload.bookingScenicRoute?.startPoint?.address || "Không xác định",
          // For scenic routes, you might want to add route name if available
          // endAddress: `Tuyến: ${trip.servicePayload.bookingScenicRoute?.routeId || "Không xác định"}`
        };
        
      case ServiceType.BOOKING_SHARE:
        return {
          startAddress: trip.servicePayload.bookingShare?.startPoint?.address || "Không xác định",
          endAddress: trip.servicePayload.bookingShare?.endPoint?.address || "Không xác định"
        };
        
      default:
        return {
          startAddress: "Không xác định"
        };
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

  // Hiển thị thông báo check-in nếu chưa check-in
  const renderCheckInWarning = () => {
    if (!isInProgress) {
      return (
        <View className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex-row items-center">
          <Icon name="alert-circle-outline" size={20} color="#F59E0B" />
          <Text className="ml-2 flex-1 text-amber-800">
            Bạn cần phải Check-in ca làm việc trong mục "Lịch làm việc" để thực hiện các tác vụ
          </Text>
        </View>
      );
    }
    return null;
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

          {/* Hiển thị cảnh báo check-in */}
          {renderCheckInWarning()}

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : activeTrips.length > 0 ? (
            activeTrips.map((trip) => {
              const canTrack = ['pickup', 'in_progress'].includes(trip.status.toLowerCase());
              const canPickup = trip.status.toLowerCase() === 'payed';
              
              // Style khi chưa check-in
              const disabledStyle = !isInProgress ? "opacity-60" : "";
              
              // Get service type info
              const serviceInfo = getServiceTypeInfo(trip);
              
              // Get location info
              const locationInfo = getLocationInfo(trip);
              
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

                    {/* Service Type */}
                    <View className="flex-row items-center mb-2">
                      <Icon name={serviceInfo.icon} size={20} color="#4b5563" />
                      <Text className="ml-2 flex-1" numberOfLines={1}>
                        {serviceInfo.label} {serviceInfo.details ? `(${serviceInfo.details})` : ''}
                      </Text>
                    </View>

                    {/* Start Point */}
                    <View className="flex-row items-start mb-2">
                      <Icon name="map-marker-radius" size={20} color="#4b5563" style={{marginTop: 2}} />
                      <View className="ml-2 flex-1">
                        <Text className="text-gray-500 text-xs">Điểm đón</Text>
                        <Text numberOfLines={2}>{locationInfo.startAddress}</Text>
                      </View>
                    </View>

                    {/* End Point - only show for relevant service types */}
                    {locationInfo.endAddress && (
                      <View className="flex-row items-start mb-2">
                        <Icon name="map-marker-check" size={20} color="#4b5563" style={{marginTop: 2}} />
                        <View className="ml-2 flex-1">
                          <Text className="text-gray-500 text-xs">Điểm đến</Text>
                          <Text numberOfLines={2}>{locationInfo.endAddress}</Text>
                        </View>
                      </View>
                    )}

                    {/* Price */}
                    <View className="flex-row items-center mb-2">
                      <Icon name="cash" size={20} color="#4b5563" />
                      <Text className="ml-2">
                        {trip.amount ? `${trip.amount.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}
                      </Text>
                    </View>

                    {/* Phone number */}
                    <View className="flex-row items-center mb-2">
                      <Icon name="phone" size={20} color="#4b5563" />
                      <Text className="ml-2">
                        {trip.customerId.phone || 'Không có SĐT'}
                      </Text>
                    </View>

                    {/* Action buttons based on status */}
                    {canPickup && (
                      <TouchableOpacity
                        onPress={() => handlePickup(trip._id)}
                        className={`mt-2 bg-green-500 rounded-md py-2 px-4 ${disabledStyle}`}
                        disabled={!isInProgress}
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
                        className={`mt-2 bg-blue-500 rounded-md py-2 px-4 ${disabledStyle}`}
                        disabled={!isInProgress}
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
      
      {/* Modal cảnh báo check-in */}
      <Modal
        visible={showCheckInWarning}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCheckInWarning(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-lg p-5 w-full max-w-md">
            <View className="flex-row items-center mb-4">
              <Icon name="alert-circle-outline" size={28} color="#F59E0B" />
              <Text className="text-lg font-bold text-amber-600 ml-2">
                Cần check-in ca làm việc
              </Text>
            </View>
            
            <Text className="text-gray-700 mb-2">
              Bạn cần phải check-in vào ca làm việc trước khi có thể thực hiện các tác vụ với chuyến đi.
            </Text>
            
            <Text className="text-gray-600 italic mb-4">
              Vui lòng vào mục "Lịch làm việc" và check-in ca làm việc hiện tại, sau đó quay lại màn hình này.
            </Text>
            
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setShowCheckInWarning(false)}
                className="bg-gray-200 rounded-md py-2 px-4 flex-1 mr-2"
              >
                <Text className="text-gray-800 font-medium text-center">Đóng</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setShowCheckInWarning(false);
                  navigation.navigate('Lịch trình');
                }}
                className="bg-blue-500 rounded-md py-2 px-4 flex-1 ml-2"
              >
                <Text className="text-white font-medium text-center">Đi đến lịch làm việc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}