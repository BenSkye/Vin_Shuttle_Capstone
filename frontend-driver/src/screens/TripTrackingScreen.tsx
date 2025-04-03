import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapComponent from '~/components/Map';
import { ServiceType } from '~/constants/service-type.enum';
import {
  BookingHourPayloadDto,
  BookingDestinationPayloadDto,
  BookingScenicRoutePayloadDto,
  BookingSharePayloadDto,
  Position,
  Trip,
  ScenicRouteDto,
  Waypoint,
} from '~/interface/trip';
import { styles } from '~/styles/TripTrackingStyle';
import {
  pickUp,
  startTrip,
  completeTrip,
  getSenicRouteById,
  getSharedItineraryById,
  getShareRouteByTripId
} from '~/services/tripServices';
import { useLocation } from '~/context/LocationContext';
import {
  CustomerInfoModal,
  EarlyEndConfirmationModal,
  CustomerInfoCard,
  TripHeader,
  TrackingStatusWarning,
  TripTypeInfo,
  ProximityInfo,
  DestinationInfo,
  ActionButtons,
  TimerManager,
} from '~/components/TripTracking';
import { RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useTripSocket from '~/hook/useTripSocket';
import { SharedItineraryStopsType } from '~/constants/shared-itinerary.enum';
import { SharedItinerary, sharedItineraryStop } from '~/interface/share-itinerary';
import { TripStatus } from '~/constants/trip.enum';
import useSharedItinerarySocket from '~/hook/useSharedItinerarySocket';

// First, properly type the route params
interface RouteParams {
  tripID: string;
}

const TripTrackingScreen = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const [tripId, setTripId] = useState<string>(route.params.tripID);
  const { data, error, isLoading } = useTripSocket(tripId);
  const [trip, setTrip] = useState<Trip | null>(null);
  const navigation = useNavigation();
  const { location, isTracking } = useLocation();

  // States
  const [customerPickupLocation, setCustomerPickupLocation] = useState<Position>({
    lat: 0,
    lng: 0,
  });
  const [customerDestination, setCustomerDestination] = useState<Position | null>(null);
  const [showDestination, setShowDestination] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routeToDestination, setRouteToDestination] = useState(false);
  const [isCustomerInfoCollapsed, setIsCustomerInfoCollapsed] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [showEarlyEndConfirmation, setShowEarlyEndConfirmation] = useState(false);
  // New state for scenic route
  const [scenicRouteData, setScenicRouteData] = useState<ScenicRouteDto | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [showScenicRoute, setShowScenicRoute] = useState(false);
  // Thêm state để quản lý trạng thái thu gọn
  const [isScenicRouteCollapsed, setIsScenicRouteCollapsed] = useState(false);
  // state for shared itinerary
  const [sharedItinerary, setSharedItinerary] = useState<SharedItinerary>(); // Replace 'any' with the actual type if available
  const [isShareItinerary, setIsShareItinerary] = useState(false);
  const sharedItineraryId = trip?.serviceType === ServiceType.BOOKING_SHARE
    ? (trip.servicePayload as BookingSharePayloadDto).bookingShare.sharedItinerary
    : null;

  const {
    data: sharedItineraryDetail,
    isLoading: sharedItineraryLoading,
    error: sharedItineraryError,
    resetHook
  } = useSharedItinerarySocket(
    trip?.serviceType === ServiceType.BOOKING_SHARE
      ? (trip.servicePayload as BookingSharePayloadDto).bookingShare.sharedItinerary
      : ''
  );
  // Effect for initialization
  React.useEffect(() => {
    const handleFetchTrip = async () => {
      await initializeLocationData();
    }
    if (trip) {
      handleFetchTrip();
    }
  }, [trip]);

  useEffect(() => {
    if (sharedItineraryError) {
      console.error('Shared itinerary socket error:', sharedItineraryError);
      Alert.alert('Lỗi', 'Không thể kết nối với dữ liệu lịch trình chia sẻ');
    }
  }, [sharedItineraryError]);

  useEffect(() => {
    if (sharedItineraryDetail) {
      console.log('sharedItineraryDetail', sharedItineraryDetail);
      setSharedItinerary(sharedItineraryDetail as SharedItinerary); // Set the shared itinerary data
    }
  }, [sharedItineraryDetail]);

  useEffect(() => {
    if (data) {
      console.log('Trip data:', data);
      setTrip(data as Trip);
    }
  }, [data]);

  useEffect(() => {
    if (sharedItineraryError) {
      console.error('Shared itinerary socket error:', sharedItineraryError);
      Alert.alert('Lỗi', 'Không thể kết nối với dữ liệu lịch trình chia sẻ');
    }
  }, [sharedItineraryError]);

  // Initialize location data based on trip type
  const initializeLocationData = async () => {
    if (!trip) return;

    if (trip.serviceType === ServiceType.BOOKING_HOUR) {
      const payload = trip.servicePayload as BookingHourPayloadDto;
      setCustomerPickupLocation(payload.bookingHour.startPoint.position);
    } else if (trip.serviceType === ServiceType.BOOKING_DESTINATION) {
      const payload = trip.servicePayload as BookingDestinationPayloadDto;
      setCustomerPickupLocation(payload.bookingDestination.startPoint.position);
      setCustomerDestination(payload.bookingDestination.endPoint.position);

      // Only show destination if trip is in progress
      const isInProgress = trip.status.toLowerCase() === 'in_progress';
      setShowDestination(isInProgress);
      setRouteToDestination(isInProgress);
    } else if (trip.serviceType === ServiceType.BOOKING_SCENIC_ROUTE) {
      const payload = trip.servicePayload as BookingScenicRoutePayloadDto;
      setCustomerPickupLocation(payload.bookingScenicRoute.startPoint.position);

      // Fetch scenic route data if trip is in progress
      const isInProgress = trip.status.toLowerCase() === 'in_progress';
      if (
        isInProgress &&
        payload.bookingScenicRoute.routeId &&
        typeof payload.bookingScenicRoute.routeId === 'object'
      ) {
        setScenicRouteData(payload.bookingScenicRoute.routeId);
        setWaypoints(payload.bookingScenicRoute.routeId.waypoints || []);
        setShowScenicRoute(true);
      } else if (isInProgress && payload.bookingScenicRoute.routeId) {
        fetchScenicRouteData(
          payload.bookingScenicRoute.routeId._id ||
          (payload.bookingScenicRoute.routeId as unknown as string)
        );
      }
    } else if (trip.serviceType === ServiceType.BOOKING_SHARE) {
      setIsShareItinerary(true);
      const payload = trip.servicePayload as BookingSharePayloadDto;
      console.log("payload131", payload)
      // await fetchSharedItineraryData(trip._id)
      setCustomerPickupLocation(payload.bookingShare.startPoint.position);
      setCustomerDestination(payload.bookingShare.endPoint.position);
    }
  };

  // Fetch scenic route data
  const fetchScenicRouteData = async (routeId: string) => {
    try {
      const scenicRoute = await getSenicRouteById(routeId);
      if (scenicRoute) {
        setScenicRouteData(scenicRoute as unknown as ScenicRouteDto);
        setWaypoints(scenicRoute.waypoints || []);
        setShowScenicRoute(true);
      }
    } catch (error) {
      console.error('Error fetching scenic route data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu tuyến đường');
    }
  };

  // const fetchSharedItineraryData = async (tripId: string) => {
  //   try {
  //     const itinerary = await getShareRouteByTripId(tripId); // Replace with actual API call
  //     if (itinerary) {
  //       console.log("itinerary160", itinerary)
  //       setSharedItinerary(itinerary as SharedItinerary); // Set the shared itinerary data
  //     }
  //   } catch (error) {
  //     console.error('Error fetching shared itinerary data:', error);
  //     Alert.alert('Lỗi', 'Không thể tải dữ liệu lịch trình chia sẻ');
  //   }
  // }
  // Event handlers
  const handleBack = () => navigation.goBack();

  const toggleCustomerInfo = () => setShowCustomerInfo(!showCustomerInfo);

  const toggleCustomerCollapse = () => setIsCustomerInfoCollapsed(!isCustomerInfoCollapsed);

  const toggleRouteDestination = () => {
    if (showDestination) {
      setRouteToDestination(!routeToDestination);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // API handlers
  const handlePickup = async () => {
    if (!trip?._id) {
      Alert.alert('Lỗi', 'Không có thông tin chuyến đi');
      return;
    }

    try {
      setLoading(true);
      const updatedTrip = await pickUp(trip._id);
      setTrip(updatedTrip);
      Alert.alert('Thành công', 'Đã xác nhận đang tới đón khách');
    } catch (error) {
      console.error('Pickup error:', error);
      Alert.alert('Lỗi', 'Không thể xác nhận đón khách');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async () => {
    if (!trip?._id) {
      Alert.alert('Lỗi', 'Không có thông tin chuyến đi');
      return;
    }

    try {
      // Check location availability
      if (!location) {
        Alert.alert('Lỗi', 'Không thể xác định vị trí của bạn. Hãy đảm bảo GPS được bật.');
        return;
      }

      // Check proximity to pickup location
      const distanceToPickup = calculateDistance(
        location.latitude,
        location.longitude,
        customerPickupLocation.lat,
        customerPickupLocation.lng
      );

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

      // Preserve customer and vehicle information
      setTrip({
        ...updatedTrip,
        customerId: trip.customerId || updatedTrip.customerId,
        vehicleId: trip.vehicleId || updatedTrip.vehicleId,
      });

      // Handle hourly booking timer
      if (trip.serviceType === ServiceType.BOOKING_HOUR) {
        const payload = trip.servicePayload as BookingHourPayloadDto;
        const totalMinutes = payload.bookingHour.totalTime;
        setTimerActive(true);
      }

      // Set destination display for destination booking
      if (trip.serviceType === ServiceType.BOOKING_DESTINATION) {
        setShowDestination(true);
        setRouteToDestination(true);
      }

      // Handle scenic route booking
      if (trip.serviceType === ServiceType.BOOKING_SCENIC_ROUTE) {
        const payload = trip.servicePayload as BookingScenicRoutePayloadDto;
        if (payload.bookingScenicRoute.routeId) {
          // If routeId is already an object with data
          if (
            typeof payload.bookingScenicRoute.routeId === 'object' &&
            payload.bookingScenicRoute.routeId._id
          ) {
            setScenicRouteData(payload.bookingScenicRoute.routeId);
            setWaypoints(payload.bookingScenicRoute.routeId.waypoints || []);
            setShowScenicRoute(true);
          } else {
            // If routeId is just an ID, fetch the data
            const routeId =
              typeof payload.bookingScenicRoute.routeId === 'string'
                ? payload.bookingScenicRoute.routeId
                : payload.bookingScenicRoute.routeId._id;
            fetchScenicRouteData(routeId);
          }
        }
      }

      // Handle shared itinerary booking
      if (trip.serviceType === ServiceType.BOOKING_SHARE) {
        const payload = trip.servicePayload as BookingSharePayloadDto;
        if (payload.bookingShare.sharedItinerary) {
          resetHook()
        }
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
    if (!trip?._id) {
      Alert.alert('Lỗi', 'Không có thông tin chuyến đi');
      return;
    }

    try {
      setLoading(true);
      const updatedTrip = await completeTrip(trip._id);
      setTrip(updatedTrip);

      Alert.alert('Thành công', 'Đã hoàn thành chuyến đi');
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

  // Timer handlers
  const handleTimerUpdate = (timeLeft: number) => {
    setRemainingTime(timeLeft);
  };

  const formatRemainingTime = (): string => {
    if (remainingTime === null) return '';

    const totalSeconds = Math.floor(remainingTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleEarlyEndRequest = () => {
    if (remainingTime && remainingTime > 60000) {
      // More than 1 minute left
      setShowEarlyEndConfirmation(true);
    } else {
      // Less than a minute left, just end it without confirmation
      handleCompleteTrip();
    }
  };

  const closeEarlyEndConfirmation = () => {
    setShowEarlyEndConfirmation(false);
  };

  const handleEarlyEndConfirm = () => {
    closeEarlyEndConfirmation();
    handleCompleteTrip();
  };

  // Thêm hàm toggle
  const toggleScenicRouteCollapse = () => {
    setIsScenicRouteCollapsed(!isScenicRouteCollapsed);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-base font-medium text-gray-700">Đang tải thông tin chuyến đi...</Text>
        </View>
      </View>
    );
  }

  // if (error) {
  //   return (
  //     <View style={styles.container}>
  //       <Text className="p-2 text-gray-800">Error: {error.message}</Text>
  //     </View>
  //   );
  // }

  if (!trip) {
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
        waypoints={showScenicRoute ? waypoints : []}
        scenicRouteCoordinates={
          showScenicRoute && scenicRouteData ? scenicRouteData.scenicRouteCoordinates : []
        }
        showScenicRoute={showScenicRoute}
        shareStops={sharedItinerary?.stops || []}
        isShareItinerary={isShareItinerary}
        onStopPress={(stop: sharedItineraryStop) => {
          setTripId(stop.trip);
        }}
      />

      {/* Header */}
      <TripHeader tripStatus={trip?.status || ''} onBack={handleBack} />

      {/* Timer manager (non-visual component) */}
      {trip?.serviceType === ServiceType.BOOKING_HOUR && timerActive && (
        <TimerManager
          totalMinutes={(trip.servicePayload as BookingHourPayloadDto).bookingHour.totalTime}
          isActive={timerActive}
          onTimerUpdate={handleTimerUpdate}
          onTimerComplete={handleCompleteTrip}
        />
      )}

      {/* Bottom info card */}

      <View style={styles.bottomCard}>
        {/* Tracking status warning */}
        <TrackingStatusWarning isTracking={isTracking} />

        {/* Trip type information */}
        <TripTypeInfo serviceType={trip?.serviceType || ''} />

        {/* Customer Info Card */}
        <CustomerInfoCard
          trip={trip}
          isCollapsed={isCustomerInfoCollapsed}
          onToggleCollapse={toggleCustomerCollapse}
          onViewMorePress={toggleCustomerInfo}
        />

        {/* Show scenic route information */}
        {trip?.serviceType === ServiceType.BOOKING_SCENIC_ROUTE && scenicRouteData && (
          <View style={styles.scenicRouteInfo}>
            <TouchableOpacity
              style={styles.scenicRouteHeader}
              onPress={toggleScenicRouteCollapse}>
              <Text style={styles.scenicRouteTitle}>
                Tuyến đường cố định: {scenicRouteData.name}
              </Text>
              <Ionicons
                name={isScenicRouteCollapsed ? 'chevron-down' : 'chevron-up'}
                size={24}
                color="#9C27B0"
              />
            </TouchableOpacity>

            {!isScenicRouteCollapsed && (
              <View style={styles.scenicRouteContent}>
                <Text style={styles.scenicRouteDescription}>{scenicRouteData.description}</Text>
                <Text style={styles.scenicRouteStats}>
                  Dự kiến: {scenicRouteData.totalDistance}km -{' '}
                  {Math.round(scenicRouteData.estimatedDuration / 60)} phút
                </Text>
                {waypoints.length > 0 && (
                  <Text style={styles.waypointText}>
                    Điểm tham quan: {waypoints.map((wp) => wp.name).join(', ')}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Destination information */}
        {trip?.serviceType !== ServiceType.BOOKING_SCENIC_ROUTE && (
          <DestinationInfo
            serviceType={trip?.serviceType || ''}
            servicePayload={trip?.servicePayload}
            showDestination={showDestination}
            routeToDestination={routeToDestination}
            onToggleRouteDestination={toggleRouteDestination}
          />
        )}

        {/* Proximity information */}
        {trip.status === TripStatus.PICKUP && (<ProximityInfo
          tripStatus={trip?.status || ''}
          location={location}
          customerPickupLocation={customerPickupLocation}
        />)}


        {/* Action buttons */}
        <View style={{ marginTop: 10 }}>
          <ActionButtons
            loading={loading}
            tripStatus={trip?.status || ''}
            serviceType={trip?.serviceType || ''}
            timerActive={timerActive}
            isTracking={isTracking}
            onPickup={handlePickup}
            onStartTrip={handleStartTrip}
            onCompleteTrip={handleCompleteTrip}
            onEarlyEnd={handleEarlyEndRequest}
            formatRemainingTime={formatRemainingTime}
          />
        </View>
      </View>

      {/* Modals */}
      <CustomerInfoModal visible={showCustomerInfo} onClose={toggleCustomerInfo} trip={trip} />

      <EarlyEndConfirmationModal
        visible={showEarlyEndConfirmation}
        onClose={closeEarlyEndConfirmation}
        onConfirm={handleEarlyEndConfirm}
        remainingTimeFormatted={formatRemainingTime()}
      />
    </SafeAreaView>
  );
};
export default TripTrackingScreen;