//@ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pickUp, cancelTrip, Trip } from '../services/tripServices';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TripStatus, tripStatusColor, tripStatusText } from '~/constants/trip.enum';
import { ServiceType } from '~/constants/service-type.enum';
import { useSchedule } from '~/context/ScheduleContext';
import useTripSocket from '~/hook/useTripSocket';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { data: trips, isLoading, resetHook } = useTripSocket();
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isInProgress, isPaused } = useSchedule(); // Lấy trạng thái ca làm việc
  const [showCheckInWarning, setShowCheckInWarning] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);

  const processTrips = (tripData: Trip[]) => {
    try {
      // Filter only active trips -  confirmed, pickup, in_progress
      const filteredTrips = tripData.filter((trip) =>
        [TripStatus.CONFIRMED, TripStatus.PICKUP, TripStatus.IN_PROGRESS].includes(trip.status)
      );

      // Sort by status priority (in_progress first, then pickup, then confirmed)
      filteredTrips.sort((a, b) => {
        const statusPriority = {
          in_progress: 1,
          pickup: 2,
          confirmed: 3,
          // booking: 4,
        };
        const statusA = statusPriority[a.status.toLowerCase()];
        const statusB = statusPriority[b.status.toLowerCase()];
        if (statusA !== statusB) {
          return statusA - statusB;
        }
        //sort by timeStartEstimate
        const dateA = new Date(a.timeStartEstimate).getTime();
        const dateB = new Date(b.timeStartEstimate).getTime();
        return dateB - dateA;
      });

      setActiveTrips(filteredTrips);
    } catch (error) {
      console.error('Error processing trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    resetHook();
    setRefreshing(false);
  };

  useEffect(() => {
    if (trips && Array.isArray(trips)) {
      setLoading(true);
      processTrips(trips);
    }
  }, [trips]);

  useFocusEffect(
    React.useCallback(() => {
      console.log('HomeScreen focused');
      resetHook();
      return () => {
      };
    }, [])
  );
  // Kiểm tra check-in trước khi thực hiện các hành động
  const handleActionWithCheckInValidation = (action: () => void) => {
    if (!isInProgress || isPaused) {
      setShowCheckInWarning(true);
      return;
    }
    action();
  };

  const handleNavigateToTrip = (trip: Trip) => {
    const status = trip.status.toLowerCase();

    // Chỉ cho phép đi đến màn hình theo dõi cho trạng thái pickup và in_progress
    if (status === TripStatus.CONFIRMED || status === 'pickup' || status === 'in_progress') {
      handleActionWithCheckInValidation(() => {
        navigation.navigate('TripTracking', { tripID: trip._id });
      });
    }
  };

  const handlePickup = async (tripId: string) => {
    handleActionWithCheckInValidation(async () => {
      try {
        setLoading(true);
        await pickUp(tripId);
        // Refresh danh sách cuốc xe sau khi đón khách thành công
        // await fetchActiveTrips();
      } catch (error) {
        console.error('Error picking up customer:', error);
        Alert.alert('Lỗi', 'Không thể đón khách. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleCancelTrip = async () => {
    if (!selectedTripId || !cancelReason.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập lý do hủy chuyến');
      return;
    }

    handleActionWithCheckInValidation(async () => {
      try {
        setCanceling(true);
        await cancelTrip(selectedTripId, cancelReason);
        Alert.alert('Thành công', 'Đã hủy cuốc xe thành công');
        setShowCancelModal(false);
        setCancelReason('');
        // Refresh danh sách cuốc xe
        // await fetchActiveTrips();

      } catch (error) {
        console.error('Error canceling trip:', error);
        Alert.alert('Lỗi', 'Không thể hủy cuốc xe. Vui lòng thử lại sau.');
      } finally {
        setCanceling(false);
      }
    });
  };

  const showCancelTripModal = (tripId: string) => {
    setSelectedTripId(tripId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  // Get service type display
  const getServiceTypeInfo = (trip: Trip): { icon: string; label: string; details?: string } => {
    switch (trip.serviceType) {
      case ServiceType.BOOKING_HOUR:
        return {
          icon: 'clock-time-four-outline',
          label: 'Thuê theo giờ',
          details: `${trip.servicePayload.bookingHour?.totalTime || 0} phút`,
        };

      case ServiceType.BOOKING_DESTINATION:
        return {
          icon: 'map-marker-distance',
          label: 'Đặt xe theo điểm đến',
          details: trip.servicePayload.bookingDestination?.distanceEstimate
            ? `${(trip.servicePayload.bookingDestination.distanceEstimate).toFixed(1)} km`
            : undefined,
        };

      case ServiceType.BOOKING_SCENIC_ROUTE:
        return {
          icon: 'routes',
          label: 'Đặt xe lộ trình tham quan',
          details: trip.servicePayload.bookingScenicRoute?.distanceEstimate
            ? `${(trip.servicePayload.bookingScenicRoute.distanceEstimate).toFixed(1)} km`
            : undefined,
        };

      case ServiceType.BOOKING_SHARE:
        return {
          icon: 'account-group',
          label: 'Đặt xe chia sẻ',
          details: `${trip.servicePayload.bookingShare?.numberOfSeat || 1} ghế`,
        };

      default:
        return {
          icon: 'car',
          label: 'Đặt xe',
        };
    }
  };

  // Get start and end points based on service type
  const getLocationInfo = (trip: Trip): { startAddress: string; endAddress?: string } => {
    switch (trip.serviceType) {
      case ServiceType.BOOKING_HOUR:
        return {
          startAddress: trip.servicePayload.bookingHour?.startPoint?.address || 'Không xác định',
        };

      case ServiceType.BOOKING_DESTINATION:
        return {
          startAddress:
            trip.servicePayload.bookingDestination?.startPoint?.address || 'Không xác định',
          endAddress: trip.servicePayload.bookingDestination?.endPoint?.address || 'Không xác định',
        };

      case ServiceType.BOOKING_SCENIC_ROUTE:
        return {
          startAddress:
            trip.servicePayload.bookingScenicRoute?.startPoint?.address || 'Không xác định',
          // For scenic routes, you might want to add route name if available
          // endAddress: `Tuyến: ${trip.servicePayload.bookingScenicRoute?.routeId || "Không xác định"}`
        };

      case ServiceType.BOOKING_SHARE:
        return {
          startAddress: trip.servicePayload.bookingShare?.startPoint?.address || 'Không xác định',
          endAddress: trip.servicePayload.bookingShare?.endPoint?.address || 'Không xác định',
        };

      default:
        return {
          startAddress: 'Không xác định',
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor:
            statusLower === 'in_progress'
              ? '#F44336'
              : statusLower === 'pickup'
                ? '#4CAF50'
                : statusLower === 'confirmed'
                  ? '#2196F3'
                  : '#FFC107',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
        }}>
        <Icon
          name={
            statusLower === 'in_progress'
              ? 'car-arrow-right'
              : statusLower === 'pickup'
                ? 'account-arrow-up'
                : statusLower === 'confirmed'
                  ? 'cash-check'
                  : 'calendar-clock'
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
    if (!isInProgress || isPaused) {
      return (
        <View className="mb-4 flex-row items-center rounded-lg border border-amber-200 bg-amber-50 p-4">
          <Icon name="alert-circle-outline" size={20} color="#F59E0B" />
          <Text className="ml-2 flex-1 text-amber-800">
            {isPaused
              ? "Ca làm việc của bạn đang tạm dừng. Vui lòng tiếp tục ca làm để thực hiện các tác vụ"
              : "Bạn cần phải Check-in ca làm việc trong mục 'Lịch làm việc' để thực hiện các tác vụ"}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="p-4">
          <Text className="mb-4 text-xl font-bold text-gray-800">
            <Icon name="car-clock" size={24} color="#1f2937" /> Cuốc xe hiện tại
          </Text>

          {/* Hiển thị cảnh báo check-in */}
          {renderCheckInWarning()}

          {(loading || isLoading) ? (
            <ActivityIndicator size="large" color="#2563eb" />
          ) : activeTrips.length > 0 ? (
            activeTrips.map((trip) => {
              const canTrack = [TripStatus.CONFIRMED, TripStatus.PICKUP, TripStatus.IN_PROGRESS].includes(trip.status.toLowerCase());
              const isExecuted = [TripStatus.PICKUP, TripStatus.IN_PROGRESS].includes(trip.status.toLowerCase());
              const canPickup = trip.status.toLowerCase() === 'confirmed';

              // Style khi chưa check-in
              const disabledStyle = !isInProgress ? 'opacity-60' : '';

              // Get service type info
              const serviceInfo = getServiceTypeInfo(trip);

              // Get location info
              const locationInfo = getLocationInfo(trip);

              return (
                <View
                  key={trip._id}
                  className={`mb-4 ${canTrack ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <TouchableOpacity
                    onPress={() => (canTrack ? handleNavigateToTrip(trip) : null)}
                    className="rounded-lg border border-gray-100 bg-white p-4 shadow-md"
                    disabled={!canTrack}
                  >
                    <View className="mb-2 flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Icon name="account" size={20} color="#4b5563" />
                        <Text className="ml-2 font-semibold">{trip.customerId.name}</Text>
                      </View>
                      {getStatusIndicator(trip.status)}
                    </View>


                    {/* Trip info rows */}
                    <View className="mb-2 flex-row items-center">
                      <Icon name="pound" size={20} color="#4b5563" />
                      <Text className="ml-2">
                        Cuốc xe:  {trip.code}
                      </Text>
                    </View>

                    <View className="mb-2 flex-row items-center">
                      <Icon name="clock" size={20} color="#4b5563" />
                      <Text className="ml-2">
                        {trip.timeStartEstimate
                          ? format(new Date(trip.timeStartEstimate), 'HH:mm dd/MM/yyyy')
                          : 'Thời gian chưa xác định'}
                      </Text>
                    </View>

                    <View className="mb-2 flex-row items-center">
                      <Icon name="car" size={20} color="#4b5563" />
                      <Text className="ml-2">
                        {trip.vehicleId.name} ({trip.vehicleId.licensePlate})
                      </Text>
                    </View>

                    {/* Service Type */}
                    <View className="mb-2 flex-row items-center">
                      <Icon name={serviceInfo.icon} size={20} color="#4b5563" />
                      <Text className="ml-2 flex-1" numberOfLines={1}>
                        {serviceInfo.label} {serviceInfo.details ? `(${serviceInfo.details})` : ''}
                      </Text>
                    </View>

                    {/* Start Point */}
                    <View className="mb-2 flex-row items-start">
                      <Icon
                        name="map-marker-radius"
                        size={20}
                        color="#4b5563"
                        style={{ marginTop: 2 }}
                      />
                      <View className="ml-2 flex-1">
                        <Text className="text-xs text-gray-500">Điểm đón</Text>
                        <Text numberOfLines={2}>{locationInfo.startAddress}</Text>
                      </View>
                    </View>

                    {/* End Point - only show for relevant service types */}
                    {locationInfo.endAddress && (
                      <View className="mb-2 flex-row items-start">
                        <Icon
                          name="map-marker-check"
                          size={20}
                          color="#4b5563"
                          style={{ marginTop: 2 }}
                        />
                        <View className="ml-2 flex-1">
                          <Text className="text-xs text-gray-500">Điểm đến</Text>
                          <Text numberOfLines={2}>{locationInfo.endAddress}</Text>
                        </View>
                      </View>
                    )}

                    {/* Price */}
                    <View className="mb-2 flex-row items-center">
                      <Icon name="cash" size={20} color="#4b5563" />
                      <Text className="ml-2">
                        {trip.amount ? `${trip.amount.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}
                        {trip.isPrepaid || trip.isPayed ? (
                          <Text className="text-xs text-blue-500 font-medium">
                            {' '}(Đã thanh toán)
                          </Text>
                        ) : (
                          <Text className="text-xs text-orange-500 font-bold">
                            {' '}(Tài xế thu tiền)
                          </Text>
                        )}
                      </Text>
                    </View>

                    {/* Phone number */}
                    <View className="mb-2 flex-row items-center">
                      <Icon name="phone" size={20} color="#4b5563" />
                      <Text className="ml-2">{trip.customerId.phone || 'Không có SĐT'}</Text>
                    </View>

                    {/* Action buttons based on status */}
                    {canPickup && (
                      <View className="mt-2 flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handlePickup(trip._id)}
                          className={`flex-1 rounded-md bg-green-500 px-4 py-2 ${disabledStyle}`}
                          disabled={!isInProgress}
                        >
                          <View className="flex-row items-center justify-center">
                            <Icon name="car-pickup" size={20} color="white" />
                            <Text className="ml-2 font-medium text-white">Đón khách</Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => showCancelTripModal(trip._id)}
                          className={`flex-1 rounded-md bg-red-500 px-4 py-2 ${disabledStyle}`}
                          disabled={!isInProgress}
                        >
                          <View className="flex-row items-center justify-center">
                            <Icon name="cancel" size={20} color="white" />
                            <Text className="ml-2 font-medium text-white">Hủy</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}

                    {isExecuted && (
                      <View className="mt-2 flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => handleNavigateToTrip(trip)}
                          className={`flex-1 rounded-md bg-blue-500 px-4 py-2 ${disabledStyle}`}
                          disabled={!isInProgress}>
                          <View className="flex-row items-center justify-center">
                            <Icon name="map-marker-path" size={20} color="white" />
                            <Text className="ml-2 font-medium text-white">Xem cuốc xe</Text>
                          </View>
                        </TouchableOpacity>
                        {trip.status.toLowerCase() === TripStatus.PICKUP && (
                          <TouchableOpacity
                            onPress={() => showCancelTripModal(trip._id)}
                            className={`flex-1 rounded-md bg-red-500 px-4 py-2 ${disabledStyle}`}
                            disabled={!isInProgress}>
                            <View className="flex-row items-center justify-center">
                              <Icon name="cancel" size={20} color="white" />
                              <Text className="ml-2 font-medium text-white">Hủy</Text>
                            </View>
                          </TouchableOpacity>
                        )}

                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View className="flex-row items-center justify-center rounded-lg bg-white p-8 shadow-sm">
              <Icon name="car-off" size={24} color="#6b7280" />
              <Text className="ml-2 text-center text-gray-500">
                Không có cuốc xe nào đang hoạt động
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
        onRequestClose={() => setShowCheckInWarning(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-4">
          <View className="w-full max-w-md rounded-lg bg-white p-5">
            <View className="mb-4 flex-row items-center">
              <Icon name="alert-circle-outline" size={28} color="#F59E0B" />
              <Text className="ml-2 text-lg font-bold text-amber-600">
                Cần check-in ca làm việc
              </Text>
            </View>

            <Text className="mb-2 text-gray-700">
              {isPaused
                ? "Bạn cần phải tiếp tục ca làm việc trước khi có thể thực hiện các tác vụ với chuyến đi."
                : "Bạn cần phải check-in vào ca làm việc trước khi có thể thực hiện các tác vụ với chuyến đi."}
            </Text>

            <Text className="mb-4 italic text-gray-600">
              {isPaused
                ? "Vui lòng vào mục 'Lịch làm việc' và tiếp tục ca làm việc hiện tại, sau đó quay lại màn hình này."
                : "Vui lòng vào mục 'Lịch làm việc' và check-in ca làm việc hiện tại, sau đó quay lại màn hình này."}
            </Text>

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setShowCheckInWarning(false)}
                className="mr-2 flex-1 rounded-md bg-gray-200 px-4 py-2">
                <Text className="text-center font-medium text-gray-800">Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowCheckInWarning(false);
                  navigation.navigate('Lịch trình');
                }}
                className="ml-2 flex-1 rounded-md bg-blue-500 px-4 py-2">
                <Text className="text-center font-medium text-white">Đi đến lịch làm việc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal nhập lý do hủy chuyến */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-4">
          <View className="w-full max-w-md rounded-lg bg-white p-5">
            <View className="mb-4 flex-row items-center">
              <Icon name="alert-circle-outline" size={28} color="#EF4444" />
              <Text className="ml-2 text-lg font-bold text-red-600">
                Xác nhận hủy cuốc xe
              </Text>
            </View>

            <Text className="mb-2 text-gray-700">
              Bạn có chắc chắn muốn hủy cuốc xe này? Hành động này không thể hoàn tác.
            </Text>

            <View className="mb-4">
              <Text className="mb-1 font-medium text-gray-700">Lý do hủy chuyến:</Text>
              <TextInput
                className="rounded-md border border-gray-300 px-3 py-2"
                placeholder="Nhập lý do hủy cuốc xe"
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setShowCancelModal(false)}
                className="mr-2 flex-1 rounded-md bg-gray-200 px-4 py-2">
                <Text className="text-center font-medium text-gray-800">Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancelTrip}
                disabled={canceling}
                className="ml-2 flex-1 rounded-md bg-red-500 px-4 py-2">
                {canceling ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-center font-medium text-white">Xác nhận hủy</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
