import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { getPersonalTrips, Trip, getRatingByTripId } from '../services/tripServices';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { TripStatus, tripStatusColor, tripStatusText } from '~/constants/trip.enum';
import { ServiceType } from '~/constants/service-type.enum';
import { BookingDestinationPayloadDto, BookingHourPayloadDto, Rating } from '~/interface/trip';

export default function TripHistoryScreen({ navigation }: { navigation: any }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [tripRating, setTripRating] = useState<Rating | null>(null);
  const [loadingRating, setLoadingRating] = useState(false);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const allTrips = await getPersonalTrips();
      
      // Filter only completed and cancelled trips
      const historyTrips = allTrips.filter(
        trip => ['completed', 'cancelled'].includes(trip.status.toLowerCase())
      );
      
      // Sort by time, newest first
      // historyTrips.sort((a, b) => {
      //   const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      //   const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      //   return timeB - timeA; // Descending order (newest first)
      // });
      
      setTrips(historyTrips);
    } catch (error) {
      console.error('Error fetching trip history:', error);
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
    
    // Refresh when returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTrips();
    });
    
    return unsubscribe;
  }, [navigation]);

  const handleShowTripDetails = async (trip: Trip) => {
    setSelectedTrip(trip);
    setShowTripDetails(true);
    
    // Fetch rating when showing trip details
    setLoadingRating(true);
    try {
      const ratingData = await getRatingByTripId(trip._id);
      setTripRating(ratingData as unknown as Rating);
    } catch (error) {
      console.error('Error fetching trip rating:', error);
      setTripRating(null);
    } finally {
      setLoadingRating(false);
    }
  };

  const getStatusText = (status: string): string => {
    const statusLower = status.toLowerCase() as TripStatus;
    return tripStatusText[statusLower] || 'Không xác định';
  };

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase() as TripStatus;
    const color = tripStatusColor[statusLower];
    
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

  const getStatusBadge = (status: string): JSX.Element => {
    const statusLower = status.toLowerCase();
    let bgColor, textColor, iconName;
    
    if (statusLower === 'completed') {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      iconName = 'check-circle';
    } else { // cancelled
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      iconName = 'close-circle';
    }
    
    return (
      <View className={`flex-row items-center py-1 px-3 rounded-full ${bgColor}`}>
        <Icon name={iconName} size={14} className={textColor} />
        <Text className={`${textColor} text-xs font-medium ml-1`}>
          {getStatusText(status)}
        </Text>
      </View>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'HH:mm dd/MM/yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Render stars based on rating value
  const renderStars = (rating: number) => {
    const stars = [];
    const maxStars = 5;
    
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <Icon 
          key={i}
          name={i <= rating ? "star" : "star-outline"} 
          size={20} 
          color={i <= rating ? "#FFD700" : "#D3D3D3"} 
          style={{ marginRight: 2 }}
        />
      );
    }
    
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {stars}
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
            <Icon name="history" size={24} color="#1f2937" /> Lịch sử chuyến đi
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : trips.length > 0 ? (
            trips.map((trip) => (
              <TouchableOpacity
                key={trip._id}
                onPress={() => handleShowTripDetails(trip)}
                className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <View className="p-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-bold text-gray-800">{trip.customerId?.name || 'Khách hàng'}</Text>
                    {getStatusBadge(trip.status)}
                  </View>
                  
                  {/* <View className="flex-row items-center mb-2">
                    <Icon name="calendar" size={16} color="#4b5563" />
                    <Text className="ml-2 text-gray-600 text-sm">
                      {formatDate(trip.createdAt)}
                    </Text>
                  </View> */}

                  <View className="flex-row items-center mb-2">
                    <Icon name="car" size={16} color="#4b5563" />
                    <Text className="ml-2 text-gray-600 text-sm">
                      {trip.vehicleId?.name || 'N/A'} ({trip.vehicleId?.licensePlate || 'N/A'})
                    </Text>
                  </View>

                  <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
                    <View className="flex-row items-center">
                      <Icon name="currency-usd" size={16} color="#4b5563" />
                      <Text className="ml-1 text-gray-700 font-medium">
                        {trip.amount?.toLocaleString('vi-VN') || '0'} VNĐ
                      </Text>
                    </View>
                    <Text className="text-blue-600 text-sm">Xem chi tiết</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex-row items-center justify-center p-8 bg-white rounded-lg shadow-sm">
              <Icon name="history-off" size={24} color="#6b7280" />
              <Text className="text-center text-gray-500 ml-2">
                Không có lịch sử chuyến đi nào
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <Modal
          visible={showTripDetails}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTripDetails(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ 
              backgroundColor: 'white', 
              borderTopLeftRadius: 20, 
              borderTopRightRadius: 20, 
              padding: 20,
              maxHeight: '80%'
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Chi tiết chuyến đi</Text>
                <TouchableOpacity onPress={() => setShowTripDetails(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={{ maxHeight: '90%' }}>
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>
                    Thông tin khách hàng
                  </Text>
                  
                  <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Tên:</Text>
                    <Text style={{ width: '70%', color: '#333' }}>{selectedTrip.customerId?.name || 'N/A'}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>SĐT:</Text>
                    <Text style={{ width: '70%', color: '#333' }}>{selectedTrip.customerId?.phone || 'N/A'}</Text>
                  </View>
                </View>
                
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>
                    Thông tin chuyến đi
                  </Text>
                  
                  <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Mã chuyến:</Text>
                    <Text style={{ width: '70%', color: '#333' }}>{selectedTrip._id}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Trạng thái:</Text>
                    <Text style={{ width: '70%', color: selectedTrip.status === 'completed' ? 'green' : 'red' }}>
                      {getStatusText(selectedTrip.status)}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Loại dịch vụ:</Text>
                    <Text style={{ width: '70%', color: '#333' }}>
                      {selectedTrip.serviceType === ServiceType.BOOKING_HOUR ? 'Đặt theo giờ' : 
                       selectedTrip.serviceType === ServiceType.BOOKING_DESTINATION ? 'Đặt theo điểm đến' : 
                       'Khác'}
                    </Text>
                  </View>
                  
                  {selectedTrip.serviceType === ServiceType.BOOKING_HOUR && (
                    <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                      <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Thời lượng:</Text>
                      <Text style={{ width: '70%', color: '#333' }}>
                        {(selectedTrip.servicePayload as BookingHourPayloadDto).bookingHour.totalTime} phút
                      </Text>
                    </View>
                  )}
                  
                  <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Địa chỉ đón:</Text>
                    <Text style={{ width: '70%', color: '#333' }}>
                      {selectedTrip.serviceType === ServiceType.BOOKING_HOUR
                        ? (selectedTrip.servicePayload as BookingHourPayloadDto).bookingHour.startPoint.address
                        : selectedTrip.serviceType === ServiceType.BOOKING_DESTINATION
                          ? (selectedTrip.servicePayload as BookingDestinationPayloadDto).bookingDestination.startPoint.address
                          : 'N/A'
                      }
                    </Text>
                  </View>
                  
                  {selectedTrip.serviceType === ServiceType.BOOKING_DESTINATION && (
                    <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                      <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Địa chỉ đến:</Text>
                      <Text style={{ width: '70%', color: '#333' }}>
                        {(selectedTrip.servicePayload as BookingDestinationPayloadDto).bookingDestination.endPoint.address}
                      </Text>
                    </View>
                  )}
                  
                  {/* <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Ngày tạo:</Text>
                    <Text style={{ width: '70%', color: '#333' }}>{formatDate(selectedTrip.createdAt)}</Text>
                  </View> */}
                  
                  {/* {selectedTrip.updatedAt && (
                    <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                      <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Cập nhật:</Text>
                      <Text style={{ width: '70%', color: '#333' }}>{formatDate(selectedTrip.updatedAt)}</Text>
                    </View>
                  )} */}
                </View>
                
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>
                    Thông tin thanh toán
                  </Text>
                  
                  <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Số tiền:</Text>
                    <Text style={{ width: '70%', fontWeight: 'bold', color: '#333' }}>
                      {selectedTrip.amount?.toLocaleString('vi-VN') || '0'} VNĐ
                    </Text>
                  </View>
                </View>
                
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>
                    Thông tin phương tiện
                  </Text>
                  
                  <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Tên xe:</Text>
                    <Text style={{ width: '70%', color: '#333' }}>{selectedTrip.vehicleId?.name || 'N/A'}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                    <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Biển số:</Text>
                    <Text style={{ width: '70%', color: '#333' }}>{selectedTrip.vehicleId?.licensePlate || 'N/A'}</Text>
                  </View>
                </View>

                {/* Add Rating Section */}
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
                      <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                        <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Điểm đánh giá:</Text>
                        <View style={{ width: '70%', flexDirection: 'row', alignItems: 'center' }}>
                          {renderStars(tripRating.rate)}
                          <Text style={{ marginLeft: 5, color: '#333' }}>
                            ({tripRating.rate}/5)
                          </Text>
                        </View>
                      </View>
                      
                      {tripRating.feedback && (
                        <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                          <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Nhận xét:</Text>
                          <Text style={{ width: '70%', color: '#333' }}>
                            {tripRating.feedback}
                          </Text>
                        </View>
                      )}
                      
                      <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                        <Text style={{ width: '30%', fontWeight: '500', color: '#666' }}>Ngày đánh giá:</Text>
                        <Text style={{ width: '70%', color: '#333' }}>
                          {formatDate(tripRating.createdAt)}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <View style={{ padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8, alignItems: 'center' }}>
                      <Icon name="star-off" size={24} color="#6b7280" />
                      <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 8 }}>
                        Chưa có đánh giá cho chuyến đi này
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}