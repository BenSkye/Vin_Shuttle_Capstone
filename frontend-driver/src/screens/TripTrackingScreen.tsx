import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
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
import { useLocation } from '~/context/LocationContext';
import { useSchedule } from '~/context/ScheduleContext';

const TripTrackingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { location, isTracking } = useLocation();
  const { updateIsInProgress } = useSchedule();
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
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [showEarlyEndConfirmation, setShowEarlyEndConfirmation] = useState(false);


  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Haversine formula to calculate distance between two points on Earth
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon1 - lon1) * Math.PI) / 180;
  
    const a = 
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in meters
  };
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
        
        // Update global state for location tracking frequency
        updateIsInProgress(isInProgress);
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
    
    // When unmounting, reset isInProgress
    return () => {
      updateIsInProgress(false);
    };
  }, [trip, updateIsInProgress]);

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
      // Check if we have the driver's current location
      if (!location) {
        Alert.alert('Lỗi', 'Không thể xác định vị trí của bạn. Hãy đảm bảo GPS được bật.');
        return;
      }
  
      // Check if we're close enough to the customer pickup location
      const distanceToPickup = calculateDistance(
        location.latitude, 
        location.longitude, 
        customerPickupLocation.lat, 
        customerPickupLocation.lng
      );
      
      // Define the minimum required proximity (20 meters)
      const MIN_PROXIMITY = 30; // meters
      
      if (distanceToPickup > MIN_PROXIMITY) {
        Alert.alert(
          'Quá xa điểm đón',
          `Bạn cần ở gần khách hàng (trong vòng ${MIN_PROXIMITY}m) để bắt đầu chuyến đi. Hiện tại bạn cách ${Math.round(distanceToPickup)}m.`,
          [{ text: 'Đã hiểu' }]
        );
        return;
      }
      
      setLoading(true);
      const updatedTrip = await startTrip(trip._id);
      
      // Preserve customer information from the original trip object
      setTrip({
        ...updatedTrip,
        customerId: trip.customerId || updatedTrip.customerId,
        vehicleId: trip.vehicleId || updatedTrip.vehicleId
      });

      // Start timer if this is a booking_hour trip
      if (trip.serviceType === ServiceType.BOOKING_HOUR) {
        const payload = trip.servicePayload as BookingHourPayloadDto;
        const totalMinutes = payload.bookingHour.totalTime;
        const cleanupTimer = startCountdownTimer(totalMinutes);
        
        // Store the cleanup function to be called when component unmounts
        return cleanupTimer;
      }
      
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
      
      // Update global state for location tracking frequency
      updateIsInProgress(false);
      
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
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handlePickup}
            disabled={!isTracking}
          >
            <MaterialIcons name="person" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Đón khách</Text>
          </TouchableOpacity>
        );
      case 'pickup':
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={handleStartTrip}
            disabled={!isTracking}
          >
            <MaterialIcons name="play-arrow" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Bắt đầu chuyến đi</Text>
          </TouchableOpacity>
        );
      case 'in_progress':
        if (trip.serviceType === ServiceType.BOOKING_HOUR && timerActive) {
          return (
            <View style={styles.timerActionContainer}>
              <View style={styles.timerContainer}>
                <MaterialIcons name="timer" size={20} color="#FF5722" />
                <Text style={styles.timerText}>{formatRemainingTime()}</Text>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FF5722' }]}
                onPress={handleEarlyEndRequest}
                disabled={!isTracking}
              >
                <MaterialIcons name="done" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Kết thúc sớm</Text>
              </TouchableOpacity>
            </View>
          );
        } else {
          return (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF5722' }]}
              onPress={handleCompleteTrip}
              disabled={!isTracking}
            >
              <MaterialIcons name="done" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Hoàn thành chuyến đi</Text>
            </TouchableOpacity>
          );
        }
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
  
  // Show tracking status message
  const renderTrackingStatus = useCallback(() => {
    if (!isTracking) {
      return (
        <View style={styles.trackingWarning}>
          <Ionicons name="warning" size={16} color="#FFA000" />
          <Text style={styles.trackingWarningText}>
            Vị trí không được cập nhật. Hãy đảm bảo GPS được bật.
          </Text>
        </View>
      );
    }
    return null;
  }, [isTracking]);

  // Add this function to render the proximity information
  const renderProximityInfo = () => {
    if (trip.status.toLowerCase() === 'pickup' && location && customerPickupLocation) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        customerPickupLocation.lat,
        customerPickupLocation.lng
      );
      
      const MIN_PROXIMITY = 30; // meters
      const isCloseEnough = distance <= MIN_PROXIMITY;
      
      return (
        <View style={[
          styles.proximityContainer,
          { backgroundColor: isCloseEnough ? '#E8F5E9' : '#FFF3E0' }
        ]}>
          <MaterialIcons 
            name={isCloseEnough ? "check-circle" : "info"} 
            size={18} 
            color={isCloseEnough ? "#4CAF50" : "#FF9800"} 
          />
          <Text style={[
            styles.proximityText,
            { color: isCloseEnough ? "#2E7D32" : "#E65100" }
          ]}>
            {isCloseEnough 
              ? `Bạn đã ở gần khách hàng (${Math.round(distance)}m)` 
              : `Bạn cần di chuyển gần khách hàng hơn (hiện tại cách ${Math.round(distance)}m, cần trong vòng ${MIN_PROXIMITY}m)`
            }
          </Text>
        </View>
      );
    }
    return null;
  };

  // Start the countdown timer
  const startCountdownTimer = (totalMinutes: number) => {
    // Convert minutes to milliseconds
    const totalTime = totalMinutes * 60 * 1000;
    const targetEndTime = new Date().getTime() + totalTime;
    
    setRemainingTime(totalTime);
    setTimerActive(true);
    
    // Store the target end time in state or local storage if needed
    // for app restarts or background mode handling
    
    // Update the timer every second
    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = targetEndTime - now;
      
      if (timeLeft <= 0) {
        // Time's up, end the trip
        clearInterval(timerInterval);
        setRemainingTime(0);
        setTimerActive(false);
        handleCompleteTrip();
      } else {
        setRemainingTime(timeLeft);
      }
    }, 1000);
    
    // Store the interval ID to clear it when component unmounts
    return () => clearInterval(timerInterval);
  };

  // Format the remaining time for display
  const formatRemainingTime = (): string => {
    if (remainingTime === null) return '';
    
    // Convert milliseconds to minutes and seconds
    const totalSeconds = Math.floor(remainingTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Format with leading zeros
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle early trip completion
  const handleEarlyEndRequest = () => {
    if (remainingTime && remainingTime > 60000) { // More than 1 minute left
      setShowEarlyEndConfirmation(true);
    } else {
      // Less than a minute left, just end it without confirmation
      handleCompleteTrip();
    }
  };

  // Close the early end confirmation modal
  const closeEarlyEndConfirmation = () => {
    setShowEarlyEndConfirmation(false);
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
        {/* Tracking status warning if location not active */}
        {renderTrackingStatus()}
        
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

        {/* Proximity information - only show in pickup status */}
        {renderProximityInfo()}

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

      {/* Early End Confirmation Modal */}
      <Modal
        visible={showEarlyEndConfirmation}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEarlyEndConfirmation}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.confirmationHeader}>
              <MaterialIcons name="warning" size={28} color="#FF9800" />
              <Text style={styles.confirmationTitle}>Kết thúc chuyến sớm</Text>
            </View>
            
            <View style={styles.confirmationBody}>
              <Text style={styles.confirmationText}>
                Bạn còn {formatRemainingTime()} phút trong thời gian thuê xe. 
                Bạn có chắc chắn muốn kết thúc chuyến đi sớm không?
              </Text>
            </View>
            
            <View style={styles.confirmationButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={closeEarlyEndConfirmation}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => {
                  closeEarlyEndConfirmation();
                  handleCompleteTrip();
                }}
              >
                <Text style={styles.confirmButtonText}>Kết thúc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TripTrackingScreen;
