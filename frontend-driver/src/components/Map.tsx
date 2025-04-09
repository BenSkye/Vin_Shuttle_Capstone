import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, UrlTile, Callout } from 'react-native-maps';
import { useLocation } from '~/context/LocationContext';
import { Position, Coordinate, Waypoint } from '~/interface/trip';
import { imgAccess } from '~/constants/imgAccess';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { styles } from '~/styles/MapStyle';
import { sharedItineraryStop } from '~/interface/share-itinerary';
import { SharedItineraryStopsType } from '~/constants/shared-itinerary.enum';
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';
import Svg, { Path } from 'react-native-svg';

const PinIcon = ({ color = '#34dbd8', size = 50 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      fillRule="evenodd"
      d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742Z"
      clipRule="evenodd"
    />
  </Svg>
);

// Component bọc để thêm số thứ tự
const CustomPin = (
  { color, size, order }: { color: string; size: number; order?: number }
) => (
  <View style={{ alignItems: 'center' }}>
    <PinIcon color={color} size={size} />
    {order && (
      <View style={{
        position: 'absolute',
        top: size * 0.16,
        backgroundColor: 'white',
        borderRadius: size * 0.1,
        width: size * 0.33,
        height: size * 0.33,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: color
      }}>
        <Text style={{
          fontSize: size * 0.2,
          fontWeight: 'bold',
          color
        }}>
          {order}
        </Text>
      </View>
    )}
  </View>
);
const MapComponent = ({
  pickupLocation,
  detinateLocation,
  showRouteToDestination = false,
  waypoints = [],
  scenicRouteCoordinates = [],
  showScenicRoute = false,
  shareStops = [],
  currentTripId = '', // ID của cuốc xe hiện tại để highlight
  nextStopIndex = -1, // Chỉ số của điểm dừng phải đi tới
  onStopPress = (stop: sharedItineraryStop) => { }, // Callback khi nhấn vào điểm 
  isShareItinerary = false, // Kiểm tra xem có phải là lộ trình chia sẻ hay không
  tripStopSelected = '', // Điểm dừng được chọn trong lộ trình chia sẻ
}: {
  pickupLocation: Position;
  detinateLocation?: Position | null;
  showRouteToDestination?: boolean;
  waypoints?: Waypoint[];
  scenicRouteCoordinates?: Coordinate[];
  showScenicRoute?: boolean;
  shareStops?: sharedItineraryStop[]; // Assuming this is the correct type for shareStops
  currentTripId?: string;
  nextStopIndex?: number;
  onStopPress?: (stop: sharedItineraryStop) => void;
  isShareItinerary?: boolean;
  tripStopSelected?: string
}) => {
  const { location, errorMsg, isTracking } = useLocation();
  const mapRef = useRef<MapView | null>(null);
  const [pickup, setPickup] = useState<{ latitude: number; longitude: number } | null>(null);
  const [detinate, setDetinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeToPickupCoordinates, setRouteToPickupCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [routeToDestinationCoordinates, setRouteToDestinationCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [scenicRouteFormattedCoordinates, setScenicRouteFormattedCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [sharedItineraryStops, setSharedItineraryStops] = useState<sharedItineraryStop[]>([]);
  const [sharedItineraryCoordinates, setSharedItineraryCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [locationTimestamp, setLocationTimestamp] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [tripStopSelectedInMap, setTripStopSelectedInMap] = useState<string>(tripStopSelected);

  useEffect(() => {
    console.log('tripStopSelectedInMap:', tripStopSelectedInMap);
  }, [tripStopSelectedInMap]);

  useEffect(() => {
    if (isShareItinerary) {
      setPickup(null);
      setDetinate(null);
      setRouteToPickupCoordinates([]);
      setRouteToDestinationCoordinates([]);
      return;
    }
    if (pickupLocation && pickupLocation.lat && pickupLocation.lng) {
      setPickup({ latitude: pickupLocation.lat, longitude: pickupLocation.lng });

      // Log pickup location
      console.log('Set pickup location:', {
        lat: pickupLocation.lat,
        lng: pickupLocation.lng,
      });
    }
    if (detinateLocation && detinateLocation.lat && detinateLocation.lng) {
      setDetinate({ latitude: detinateLocation.lat, longitude: detinateLocation.lng });

      // Log destination location
      console.log('Set destination location:', {
        lat: detinateLocation.lat,
        lng: detinateLocation.lng,
      });
    } else {
      setDetinate(null);
    }
  }, [pickupLocation, detinateLocation, isShareItinerary]);

  // Format scenic route coordinates
  useEffect(() => {
    if (scenicRouteCoordinates && scenicRouteCoordinates.length > 0) {
      const formattedCoords = scenicRouteCoordinates.map((coord) => ({
        latitude: coord.lat,
        longitude: coord.lng,
      }));
      setScenicRouteFormattedCoordinates(formattedCoords);

      console.log(`Formatted ${formattedCoords.length} scenic route coordinates`);
    } else {
      setScenicRouteFormattedCoordinates([]);
    }
  }, [scenicRouteCoordinates]);

  // Update timestamp when location changes
  useEffect(() => {
    if (location) {
      setLocationTimestamp(new Date());
    }
  }, [location]);

  // Fit map to include all relevant points (driver, pickup, waypoints, and destination if available)
  useEffect(() => {
    if (isShareItinerary || isUserInteracting || !location || !mapRef.current) {
      return;
    }

    // Chỉ center vào xe, không quan tâm pickup/destination
    mapRef.current.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01, // Zoom level cố định
        longitudeDelta: 0.01,
      },
      1000
    );
  }, [location, isShareItinerary, isUserInteracting]);
  useEffect(() => {
    console.log('shareStops143:', shareStops);
    setSharedItineraryStops(shareStops);
  }, [shareStops]);

  const fetchRouteForItinerary = useCallback(async (
    { sharedItineraryStops, location }:
      { sharedItineraryStops: sharedItineraryStop[], location: { latitude: number; longitude: number } }) => {
    //lấy ra các stop chưa đi qua
    const avaibleStop = sharedItineraryStops.filter((stop) => !stop.isPass);
    const stopList: { latitude: number; longitude: number }[] = avaibleStop.map((stop) => ({
      latitude: stop.point.position.lat,
      longitude: stop.point.position.lng,
    }));
    await fetchRouteForManyStops(
      location,
      stopList,
      setSharedItineraryCoordinates
    );
    setIsLoading(false);
  }, []);
  // Format shared itinerary stops

  useEffect(() => {
    if (sharedItineraryStops) {
      console.log('sharedItineraryStops167:', sharedItineraryStops);
    }
    if (sharedItineraryStops.length > 0 && location) {
      fetchRouteForItinerary({
        sharedItineraryStops, location
      });
    }
  }, [location, sharedItineraryStops, fetchRouteForItinerary]);



  // Get route from driver to pickup
  useEffect(() => {
    if (isShareItinerary) {
      return;
    }
    if (
      location &&
      pickup &&
      pickup.latitude &&
      pickup.longitude &&
      !showRouteToDestination &&
      !showScenicRoute
    ) {
      fetchRoute(
        { latitude: location.latitude, longitude: location.longitude },
        pickup,
        setRouteToPickupCoordinates
      );
      setIsLoading(false);
    }
  }, [location, pickup, showRouteToDestination, showScenicRoute, isShareItinerary]);

  // Get route from driver to destination when in destination mode
  useEffect(() => {
    if (isShareItinerary) {
      return;
    }
    if (
      location &&
      detinate &&
      detinate.latitude &&
      detinate.longitude &&
      showRouteToDestination &&
      !showScenicRoute
    ) {
      fetchRoute(
        { latitude: location.latitude, longitude: location.longitude },
        detinate,
        setRouteToDestinationCoordinates
      );

      // Clear the pickup route when showing route to destination
      setRouteToPickupCoordinates([]);
      setIsLoading(false);

    }
  }, [location, detinate, showRouteToDestination, showScenicRoute, isShareItinerary]);

  // Helper function to fetch routes
  const fetchRoute = async (
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number },
    setRouteCoordinates: React.Dispatch<
      React.SetStateAction<{ latitude: number; longitude: number }[]>
    >
  ) => {
    // Reset errors
    setRouteError(null);

    // Validate coordinates
    if (
      !isValidCoordinate(from.latitude, from.longitude) ||
      !isValidCoordinate(to.latitude, to.longitude)
    ) {
      console.log('Invalid coordinates:', { from, to });
      setRouteError('Invalid coordinates');
      return;
    }

    const url = `${OSRM_API}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?geometries=geojson`;

    console.log('Fetching route:', url);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.routes) {
        console.log('Invalid OSRM response data:', data);
        setRouteError('Invalid route data received');
        return;
      }

      if (
        data.routes.length > 0 &&
        data.routes[0].geometry &&
        data.routes[0].geometry.coordinates
      ) {
        const coordinates = data.routes[0].geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        console.log(`Route found with ${coordinates.length} points`);
        setRouteCoordinates(coordinates);
      } else {
        console.log('No route found in data:', data);
        setRouteError('No route found');
      }
    } catch (error) {
      console.error('Error fetching route data:', error);
      setRouteError(
        `Failed to load route: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  const fetchRouteForManyStops = async (
    vehicelLocation: { latitude: number; longitude: number },
    stops: { latitude: number; longitude: number }[],
    setRouteCoordinates: React.Dispatch<
      React.SetStateAction<{ latitude: number; longitude: number }[]>
    >
  ) => {
    setRouteError(null);
    if (stops.length < 1) {
      setRouteError('At least 1 stop are required');
      return;
    }
    for (const stop of stops) {
      if (!isValidCoordinate(stop.latitude, stop.longitude)) {
        console.log('Invalid coordinates:', stop);
        setRouteError(`Invalid coordinates: ${stop.latitude}, ${stop.longitude}`);
        return;
      }
    }
    console.log('list Stop', stops);
    const coordinatesString1 = `${vehicelLocation.longitude},${vehicelLocation.latitude};`;
    const coordinatesString2 = stops
      .map(point => `${point.longitude},${point.latitude}`)
      .join(';');
    const coordinatesString = coordinatesString1 + coordinatesString2;
    console.log('Coordinates string:', coordinatesString);
    const url = `${OSRM_API}/${coordinatesString}?geometries=geojson`;
    console.log('Fetching route for many stops:', url);
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.routes) {
        console.log('Invalid OSRM response data:', data);
        setRouteError('Invalid route data received');
        return;
      }

      if (
        data.routes.length > 0 &&
        data.routes[0].geometry &&
        data.routes[0].geometry.coordinates
      ) {
        const coordinates = data.routes[0].geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        console.log(`Route found with ${coordinates.length} points`);
        console.log('coordinates343:', coordinates);
        setRouteCoordinates(coordinates);
      } else {
        console.log('No route found in data:', data);
        setRouteError('No route found');
      }
    } catch (error) {
      console.error('Error fetching route data:', error);
      setRouteError(
        `Failed to load route: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }



  // Helper to validate coordinates
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat !== 0 &&
      lng !== 0 && // Check if not default values
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
    );
  };

  // Format location timestamp
  const formatTimestamp = (): string => {
    if (!locationTimestamp) return 'Chưa có dữ liệu';

    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - locationTimestamp.getTime()) / 1000);

    if (diffSeconds < 10) return 'Vừa cập nhật';
    if (diffSeconds < 60) return `${diffSeconds} giây trước`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;

    return locationTimestamp.toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (location && !isLoading) ? (
        <View style={styles.container}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude || 10.8418,
              longitude: location.longitude || 106.837,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            ref={mapRef}
            provider={undefined}
            rotateEnabled={false}
            onPanDrag={() => setIsUserInteracting(true)}
            onRegionChangeComplete={() => setIsUserInteracting(false)}
          >
            <UrlTile
              urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              shouldReplaceMapContent={true}
              maximumZ={19}
              tileSize={512}
              flipY={false}
            />

            {/* Route to pickup point - blue */}
            {routeToPickupCoordinates.length > 0 && !showRouteToDestination && !showScenicRoute && (
              <Polyline
                coordinates={routeToPickupCoordinates.slice(0, 100)} // Giới hạn 100 điểm
                strokeWidth={4}
                strokeColor="#1E88E5"
              />
            )}

            {/* Route to destination - orange */}
            {routeToDestinationCoordinates.length > 0 &&
              showRouteToDestination &&
              !showScenicRoute && (
                <Polyline
                  coordinates={routeToDestinationCoordinates}
                  strokeWidth={4}
                  strokeColor="#FF5722"
                  lineDashPattern={[0]}
                />
              )}

            {/* Scenic route - purple */}
            {scenicRouteFormattedCoordinates.length > 0 && showScenicRoute && (
              <Polyline
                coordinates={scenicRouteFormattedCoordinates}
                strokeWidth={5}
                strokeColor="#9C27B0"
                lineDashPattern={[0]}
              />
            )}


            {/* Shared itinerary route - cyan */}
            {sharedItineraryCoordinates.length > 0 && (
              <Polyline
                coordinates={sharedItineraryCoordinates}
                strokeWidth={4}
                strokeColor="#34dbd8" // Indigo color for shared route
                lineDashPattern={[0]} // Dashed line
              />
            )}



            {/* Marker cho vị trí hiện tại */}
            <Marker.Animated
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Vị trí tài xế"
              anchor={{ x: 0.5, y: 0.5 }}>
              <Image
                source={imgAccess.busTopView}
                style={{
                  width: 40,
                  height: 40,
                  transform: [{ rotate: `${location.heading !== null ? location.heading : 0}deg` }],
                }}
                resizeMode="contain"
              />
            </Marker.Animated>

            {/* Marker cho điểm đón - only show if not in scenic route or destination routing mode */}
            {pickup &&
              isValidCoordinate(pickup.latitude, pickup.longitude) &&
              !showRouteToDestination &&
              !showScenicRoute && (
                <Marker coordinate={pickup} title="Điểm đón" pinColor="#4CAF50" />
              )}

            {/* Marker cho điểm đến */}
            {detinate &&
              isValidCoordinate(detinate.latitude, detinate.longitude) &&
              !showScenicRoute && (
                <Marker coordinate={detinate} title="Điểm đến" pinColor="#FF5722" />
              )}

            {/* Waypoint markers for scenic route */}
            {showScenicRoute &&
              waypoints &&
              waypoints.length > 0 &&
              waypoints.map((waypoint, index) => (
                <Marker
                  key={`waypoint-${index}`}
                  coordinate={{
                    latitude: waypoint.position.lat,
                    longitude: waypoint.position.lng,
                  }}
                  title={`Điểm ${index + 1}: ${waypoint.name}`}
                >
                  {/* <View style={styles.waypointMarker}>
                    <MaterialIcons name="place" size={30} color="#9C27B0" />
                    <Text style={styles.waypointNumber}>{index + 1}</Text>
                  </View>
                  <Callout>
                    <View style={styles.callout}>
                      <Text style={styles.calloutTitle}>{waypoint.name}</Text>
                    </View>
                  </Callout> */}
                  <CustomPin
                    color={"#9C27B0"}
                    size={50}
                    order={index + 1}
                  />
                </Marker>
              ))
            }


            {sharedItineraryStops &&
              sharedItineraryStops.length > 0 &&
              sharedItineraryStops.map((stop, index) => {

                // Xác định màu sắc dựa trên pointType
                let pinColor = "#34dbd8"; // Màu mặc định
                let iconColor = "#34dbd8"; // Màu icon mặc định

                if (stop.pointType === SharedItineraryStopsType.START_POINT) {
                  pinColor = "#34dbd8"; // Màu cyan cho điểm bắt đầu
                  iconColor = "#34dbd8";
                } else if (stop.pointType === SharedItineraryStopsType.END_POINT) {
                  pinColor = "#eb984e"; // Màu cam cho điểm kết thúc
                  iconColor = "#eb984e";
                }

                // Nếu đã đi qua thì chuyển sang màu xám
                if (stop.isPass) {
                  iconColor = "#888";
                }
                // Nếu là điểm dừng tiếp theo thì màu đỏ
                else if (index === nextStopIndex) {
                  iconColor = "#FF5722";
                }

                return (
                  <Marker
                    key={`stop-${index}`}
                    coordinate={{
                      latitude: stop.point.position.lat,
                      longitude: stop.point.position.lng,
                    }}
                    onPress={() => onStopPress(stop)}
                    title={`Điểm ${stop.pointType === SharedItineraryStopsType.START_POINT ? 'Đón' : "Trả"} cuốc xe ${stop.trip}`}
                  >
                    {stop.trip === tripStopSelected ? (
                      <CustomPin
                        color={iconColor}
                        size={55}
                        order={stop.order}
                      />
                    ) : (
                      <CustomPin
                        color={iconColor}
                        size={40}
                        order={stop.order}
                      />
                    )}


                  </Marker>
                );
              })
            }

          </MapView>

          {/* Scenic Route Indicator */}
          {showScenicRoute && (
            <View style={styles.routeIndicator}>
              <Text style={styles.routeIndicatorText}>Đang hiển thị: Tuyến đường cố định</Text>
            </View>
          )}

          {/* Location status indicator */}
          <View style={styles.locationStatusBar}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: isTracking ? '#4CAF50' : '#F44336' },
              ]}>
              <Ionicons
                name={isTracking ? 'location' : 'location-outline'}
                size={14}
                color="#fff"
              />
            </View>
            <Text style={styles.locationStatusText}>
              {isTracking
                ? `Vị trí đang được cập nhật (${formatTimestamp()})`
                : 'Vị trí không được cập nhật'}
            </Text>
          </View>

          {routeError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{routeError}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-base font-medium text-gray-700">Đang tải tuyến đường và vị trí ...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default MapComponent;