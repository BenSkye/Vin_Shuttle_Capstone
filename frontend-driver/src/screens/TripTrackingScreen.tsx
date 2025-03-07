import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapComponent from '~/components/Map';
import { ServiceType } from '~/constants/service-type.enum';
import {
  BookingHourPayloadDto,
  BookingDestinationPayloadDto,
  Position,
  Trip,
} from '~/interface/trip';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { styles } from '~/styles/TripTrackingStyle';
import { pickUp, startTrip, completeTrip } from '~/services/tripServices';

const TripTrackingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [customerPickupLocation, setCustomerPickupLocation] = useState<Position>({
    lat: 0,
    lng: 0,
  });
  const [customerDestination, setCustomerDestination] = useState<Position | null>(null);
  const [showDestination, setShowDestination] = useState(false);
  const [trip, setTrip] = useState<Trip>(route.params?.trip as Trip);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routeToDestination, setRouteToDestination] = useState(false);
  const [isCustomerInfoCollapsed, setIsCustomerInfoCollapsed] = useState(false);

  // Get pickup and destination locations based on trip type
  useEffect(() => {
    if (trip) {
      if (trip.serviceType === ServiceType.BOOKING_HOUR) {
        const payload = trip.servicePayload as BookingHourPayloadDto;
        setCustomerPickupLocation(payload.bookingHour.startPoint.position);
      } else if (trip.serviceType === ServiceType.BOOKING_DESTINATION) {
        const payload = trip.servicePayload as BookingDestinationPayloadDto;
        setCustomerPickupLocation(payload.bookingDestination.startPoint.position);

        // Store destination but don't show it until trip is started
        setCustomerDestination(payload.bookingDestination.endPoint.position);

        // Only show destination if trip is in progress
        const isInProgress = trip.status.toLowerCase() === 'in_progress';
        setShowDestination(isInProgress);

        // Also set route to destination if in progress
        setRouteToDestination(isInProgress);
      }

      // Log the trip details for debugging
      console.log('Trip details:', {
        id: trip._id,
        status: trip.status,
        serviceType: trip.serviceType,
        pickupLocation: customerPickupLocation,
        destinationLocation: customerDestination,
        showDestination: showDestination,
        routeToDestination: routeToDestination,
      });
    }
  }, [trip]);

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleCustomerInfo = () => {
    setShowCustomerInfo(!showCustomerInfo);
  };

  const toggleCustomerCollapse = () => {
    setIsCustomerInfoCollapsed(!isCustomerInfoCollapsed);
  };

  const handlePickup = async () => {
    try {
      setLoading(true);
      const updatedTrip = await pickUp(trip._id);
      setTrip(updatedTrip);
      Alert.alert('Thành công', 'Đã xác nhận đón khách');
    } catch (error) {
      console.error('Pickup error:', error);
      Alert.alert('Lỗi', 'Không thể xác nhận đón khách');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async () => {
    try {
      setLoading(true);
      const updatedTrip = await startTrip(trip._id);
      setTrip(updatedTrip);

      // Set showDestination to true when trip starts if this is a destination booking
      if (trip.serviceType === ServiceType.BOOKING_DESTINATION) {
        setShowDestination(true);
        // Also show route to destination
        setRouteToDestination(true);
      }

      Alert.alert('Thành công', 'Đã bắt đầu chuyến đi');
    } catch (error) {
      console.error('Start trip error:', error);
      Alert.alert('Lỗi', 'Không thể bắt đầu chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    try {
      setLoading(true);
      const updatedTrip = await completeTrip(trip._id);
      setTrip(updatedTrip);
      Alert.alert('Thành công', 'Đã hoàn thành chuyến đi');
      // Navigate back after small delay to show the success message
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Complete trip error:', error);
      Alert.alert('Lỗi', 'Không thể hoàn thành chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  // Toggle between pickup and destination routes (for destination trips in progress)
  const toggleRouteDestination = () => {
    if (showDestination) {
      setRouteToDestination(!routeToDestination);
    }
  };

  // Determine which button to show based on trip status
  const renderActionButton = () => {
    if (loading) {
      return (
        <View style={styles.actionButtonContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      );
    }

    switch (trip.status.toLowerCase()) {
      case 'assigned':
        return (
          <TouchableOpacity style={styles.actionButton} onPress={handlePickup}>
            <MaterialIcons name="person" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Đón khách</Text>
          </TouchableOpacity>
        );
      case 'pickup':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={handleStartTrip}>
            <MaterialIcons name="play-arrow" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Bắt đầu chuyến đi</Text>
          </TouchableOpacity>
        );
      case 'in_progress':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF5722' }]}
            onPress={handleCompleteTrip}>
            <MaterialIcons name="done" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Hoàn thành chuyến đi</Text>
          </TouchableOpacity>
        );
      case 'completed':
        return (
          <View style={[styles.actionButton, { backgroundColor: '#8BC34A' }]}>
            <MaterialIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Chuyến đi đã hoàn thành</Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Display destination information for BOOKING_DESTINATION when in progress
  const renderDestinationInfo = () => {
    if (trip.serviceType === ServiceType.BOOKING_DESTINATION && showDestination) {
      const payload = trip.servicePayload as BookingDestinationPayloadDto;
      return (
        <TouchableOpacity
          style={[styles.destinationContainer, routeToDestination ? styles.activeDestination : {}]}
          onPress={toggleRouteDestination}>
          <View style={styles.destinationHeader}>
            <MaterialIcons name="location-on" size={18} color="#FF5722" />
            <Text style={styles.destinationTitle}>Điểm đến</Text>
            <View style={styles.routeToggle}>
              <Text style={styles.routeToggleText}>
                {routeToDestination ? 'Đang hiển thị lộ trình' : 'Nhấn để xem lộ trình'}
              </Text>
            </View>
          </View>
          <Text style={styles.destinationAddress}>
            {payload.bookingDestination.endPoint.address}
          </Text>
          {payload.bookingDestination.distanceEstimate && (
            <Text style={styles.destinationDistance}>
              Khoảng cách: {(payload.bookingDestination.distanceEstimate / 1000).toFixed(1)} km
            </Text>
          )}
        </TouchableOpacity>
      );
    }
    return null;
  };

  if (!route.params) {
    return (
      <View style={styles.container}>
        <Text className="p-2 text-gray-800">No trip details provided</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Map takes full screen */}
      <MapComponent
        pickupLocation={customerPickupLocation}
        detinateLocation={showDestination ? customerDestination : null}
        showRouteToDestination={routeToDestination}
      />

      {/* Header bar with back button and semi-transparent background */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', marginLeft: 12, fontSize: 16 }}>
          Trạng thái: {trip.status.toUpperCase()}
        </Text>
      </View>

      {/* Bottom info card */}
      <View style={styles.bottomCard}>
        <View style={styles.tripHeader}>
          <View style={styles.tripTypeContainer}>
            <FontAwesome5 name="car" size={16} color="#1E88E5" />
            <Text style={styles.tripTypeText}>
              {trip.serviceType === ServiceType.BOOKING_HOUR
                ? 'Đặt xe theo giờ'
                : trip.serviceType === ServiceType.BOOKING_DESTINATION
                  ? 'Đặt xe theo điểm đến'
                  : 'Chuyến đi'}
            </Text>
          </View>
        </View>

        <View style={styles.customerContainer}>
          <TouchableOpacity 
            style={styles.customerRowHeader} 
            onPress={toggleCustomerCollapse}
          >
            <View style={styles.customerAvatarContainer}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerInitial}>
                  {trip.customerId?.name ? trip.customerId.name.charAt(0).toUpperCase() : 'K'}
                </Text>
              </View>
            </View>
            <View style={styles.customerHeaderInfo}>
              <Text style={styles.customerName}>{trip.customerId?.name || 'N/A'}</Text>
              <Text style={styles.customerPhone}>{trip.customerId?.phone || 'N/A'}</Text>
            </View>
            <TouchableOpacity onPress={toggleCustomerCollapse}>
              <MaterialIcons 
                name={isCustomerInfoCollapsed ? "keyboard-arrow-down" : "keyboard-arrow-up"} 
                size={24} 
                color="#333" 
              />
            </TouchableOpacity>
          </TouchableOpacity>

          {!isCustomerInfoCollapsed && (
            <View style={styles.customerDetails}>
              {trip.serviceType === ServiceType.BOOKING_HOUR && (
                <Text style={styles.customerTime}>
                  Thời gian thuê xe:{' '}
                  {(trip.servicePayload as BookingHourPayloadDto).bookingHour.totalTime} phút
                </Text>
              )}
              <Text style={styles.customerAddress}>
                {trip.serviceType === ServiceType.BOOKING_HOUR
                  ? `Địa chỉ đón: ${(trip.servicePayload as BookingHourPayloadDto).bookingHour.startPoint.address}`
                  : trip.serviceType === ServiceType.BOOKING_DESTINATION
                    ? `Điểm đón: ${(trip.servicePayload as BookingDestinationPayloadDto).bookingDestination.startPoint.address}`
                    : 'N/A'}
              </Text>
              <TouchableOpacity 
                style={styles.viewMoreButton} 
                onPress={toggleCustomerInfo}
              >
                <Text style={styles.viewMoreText}>Xem chi tiết</Text>
                <MaterialIcons name="keyboard-arrow-right" size={18} color="#1E88E5" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Destination information - only show for destination booking when in progress */}
        {renderDestinationInfo()}

        {/* Action button section */}
        <View style={{ marginTop: 15 }}>{renderActionButton()}</View>
      </View>

      {/* Customer Info Modal */}
      <Modal
        visible={showCustomerInfo}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleCustomerInfo}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông tin khách hàng</Text>
              <TouchableOpacity onPress={toggleCustomerInfo}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollContainer}
              contentContainerStyle={styles.modalBody}
              showsVerticalScrollIndicator={true}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tên:</Text>
                <Text style={styles.infoValue}>{trip.customerId?.name || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số điện thoại:</Text>
                <Text style={styles.infoValue}>{trip.customerId?.phone || 'N/A'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã chuyến đi:</Text>
                <Text style={styles.infoValue}>{trip._id}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phương tiện:</Text>
                <Text style={styles.infoValue}>
                  {trip.vehicleId?.name} ({trip.vehicleId?.licensePlate})
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số tiền:</Text>
                <Text style={styles.infoValue}>{trip.amount.toLocaleString('vi-VN')} VND</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Trạng thái:</Text>
                <Text style={styles.infoValue}>{trip.status}</Text>
              </View>

              {trip.serviceType === ServiceType.BOOKING_DESTINATION && (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Điểm đón:</Text>
                    <Text style={styles.infoValue}>
                      {
                        (trip.servicePayload as BookingDestinationPayloadDto).bookingDestination
                          .startPoint.address
                      }
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Điểm đến:</Text>
                    <Text style={styles.infoValue}>
                      {
                        (trip.servicePayload as BookingDestinationPayloadDto).bookingDestination
                          .endPoint.address
                      }
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Khoảng cách:</Text>
                    <Text style={styles.infoValue}>
                      {(
                        (trip.servicePayload as BookingDestinationPayloadDto).bookingDestination
                          .distanceEstimate / 1000
                      ).toFixed(1)}{' '}
                      km
                    </Text>
                  </View>
                </>
              )}

              {trip.serviceType === ServiceType.BOOKING_HOUR && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Thời gian thuê:</Text>
                  <Text style={styles.infoValue}>
                    {(trip.servicePayload as BookingHourPayloadDto).bookingHour.totalTime} phút
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TripTrackingScreen;
