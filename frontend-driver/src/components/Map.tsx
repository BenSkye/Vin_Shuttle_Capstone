import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, UrlTile, Callout } from 'react-native-maps';
import { useLocation } from '~/context/LocationContext';
import { Position, Coordinate, Waypoint } from '~/interface/trip';
import { imgAccess } from '~/constants/imgAccess';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { styles } from '~/styles/MapStyle';
import { sharedItineraryStop } from '~/interface/share-itinerary';
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

const MapComponent = ({
  pickupLocation,
  detinateLocation,
  showRouteToDestination = false,
  waypoints = [],
  scenicRouteCoordinates = [],
  showScenicRoute = false,
  shareStops = [],
  currentTripId = '', // ID của chuyến đi hiện tại để highlight
  currentStopIndex = -1, // Chỉ số của điểm dừng hiện tại để highlight
  onStopPress = () => {}, // Callback khi nhấn vào điểm dừng
}: {
  pickupLocation: Position;
  detinateLocation?: Position | null;
  showRouteToDestination?: boolean;
  waypoints?: Waypoint[];
  scenicRouteCoordinates?: Coordinate[];
  showScenicRoute?: boolean;
  shareStops?: sharedItineraryStop[]; // Assuming this is the correct type for shareStops
  currentTripId?: string;
  currentStopIndex?: number;
  onStopPress?: (stop: sharedItineraryStop) => void;
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
  const [routeError, setRouteError] = useState<string | null>(null);
  const [locationTimestamp, setLocationTimestamp] = useState<Date | null>(null);

  useEffect(() => {
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
  }, [pickupLocation, detinateLocation]);

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
    if (location && mapRef.current) {
      const points = [{ latitude: location.latitude, longitude: location.longitude }];

      if (pickup) points.push(pickup);
      if (detinate) points.push(detinate);

      // Add waypoints if available
      if (waypoints && waypoints.length > 0) {
        waypoints.forEach((waypoint) => {
          if (waypoint.position && waypoint.position.lat && waypoint.position.lng) {
            points.push({
              latitude: waypoint.position.lat,
              longitude: waypoint.position.lng,
            });
          }
        });
      }

      // Only fit bounds if we have multiple points
      if (points.length > 1) {
        mapRef.current.fitToCoordinates(points, {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        });
      } else {
        // If only driver location, center on that
        mapRef.current.animateToRegion(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }
    }
  }, [location, pickup, detinate, waypoints]);

  // Zoom to current stop when it changes
  useEffect(() => {
    if (
      mapRef.current && 
      currentStopIndex >= 0 && 
      sharedItineraryStops && 
      sharedItineraryStops[currentStopIndex]
    ) {
      const currentStop = sharedItineraryStops[currentStopIndex];
      const { lat, lng } = currentStop.point.position;
      
      mapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
    }
  }, [currentStopIndex, sharedItineraryStops]);

  // Get route from driver to pickup
  useEffect(() => {
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
    }
  }, [location, pickup, showRouteToDestination, showScenicRoute]);

  // Get route from driver to destination when in destination mode
  useEffect(() => {
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
    }
  }, [location, detinate, showRouteToDestination, showScenicRoute]);

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

  // Format shared itinerary stops
  useEffect(() => {
    if (shareStops && shareStops.length > 0) {
      const formattedStops = shareStops.map((stop) => ({
        ...stop,
        point: {
          ...stop.point,
          position: {
            lat: stop.point.position.lat,
            lng: stop.point.position.lng,
          },
        },
      }));
      setSharedItineraryStops(formattedStops);
    }
  }, [shareStops]);

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
      ) : location ? (
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
            rotateEnabled={true}>
            <UrlTile
              urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              shouldReplaceMapContent={true}
              maximumZ={25}
              tileSize={512}
              flipY={false}
            />

            {/* Route to pickup point - blue */}
            {routeToPickupCoordinates.length > 0 && !showRouteToDestination && !showScenicRoute && (
              <Polyline
                coordinates={routeToPickupCoordinates}
                strokeWidth={4}
                strokeColor="#1E88E5"
                lineDashPattern={[0]}
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
                  title={`Điểm ${index + 1}: ${waypoint.name}`}>
                  <View style={styles.waypointMarker}>
                    <MaterialIcons name="place" size={30} color="#9C27B0" />
                    <Text style={styles.waypointNumber}>{index + 1}</Text>
                  </View>
                  <Callout>
                    <View style={styles.callout}>
                      <Text style={styles.calloutTitle}>{waypoint.name}</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}

            {/* Shared Itinerary Stops */}
            {sharedItineraryStops && sharedItineraryStops.length > 0 && sharedItineraryStops.map((stop, index) => {
              // Kiểm tra xem có vị trí hợp lệ không
              if (!stop.point || !stop.point.position || !isValidCoordinate(stop.point.position.lat, stop.point.position.lng)) {
                console.log(`Invalid position for shared stop ${index}:`, stop);
                return null;
              }
              
              // Xác định loại điểm dừng (đón/trả)
              const isPickup = stop.pointType === 'startPoint'; 
              
              // Màu sắc dựa vào loại điểm và trạng thái
              const pinColor = isPickup ? '#4CAF50' : '#FF5722'; // Xanh cho đón, Cam cho trả
              const passedColor = '#9E9E9E'; // Màu xám cho điểm đã đi qua
              const iconColor = stop.isPass ? passedColor : pinColor;
              
              // Kiểm tra xem đây có phải là điểm dừng hiện tại không
              const isCurrentStop = index === currentStopIndex;
              // Kiểm tra xem đây có phải là chuyến đi hiện tại không
              const isCurrentTrip = stop.trip === currentTripId;
              
              return (
                <Marker
                  key={`shared-stop-${index}`}
                  coordinate={{
                    latitude: stop.point.position.lat,
                    longitude: stop.point.position.lng,
                  }}
                  title={isPickup ? "Điểm đón" : "Điểm trả"}
                  description={`Điểm ${stop.order} - ${stop.isPass ? 'Đã qua' : 'Chưa qua'}`}
                  onPress={() => onStopPress(stop)} // Callback khi nhấn vào marker
                >
                  <View style={{
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Icon với màu sắc đặc biệt nếu là điểm hiện tại */}
                    <MaterialIcons 
                      name={isPickup ? "person-pin-circle" : "place"} 
                      size={isCurrentStop ? 36 : 30} // Size lớn hơn nếu là điểm hiện tại
                      color={
                        isCurrentStop 
                          ? '#1565C0' // Màu nổi bật nếu là điểm hiện tại
                          : (stop.isPass 
                            ? passedColor 
                            : (isCurrentTrip ? pinColor : '#607D8B')) // Màu khác nếu là chuyến đi hiện tại
                      } 
                    />
                    
                    {/* Số thứ tự điểm dừng */}
                    <View style={{
                      position: 'absolute',
                      backgroundColor: stop.isPass ? '#BDBDBD' : '#FFFFFF',
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      top: -5,
                      right: -5,
                      borderWidth: 1,
                      borderColor: iconColor,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: stop.isPass ? '#FFFFFF' : '#000000',
                      }}>
                        {stop.order}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Thông tin chi tiết khi nhấn vào marker */}
                  <Callout>
                    <View style={styles.callout}>
                      <Text style={styles.calloutTitle}>
                        {isPickup ? "Điểm đón khách" : "Điểm trả khách"} #{stop.order}
                      </Text>
                      <Text style={styles.calloutDescription}>
                        {stop.point.address}
                      </Text>
                      <Text style={{
                        fontSize: 12, 
                        fontWeight: 'bold',
                        color: stop.isPass ? '#4CAF50' : '#757575',
                        marginTop: 4
                      }}>
                        {stop.isPass ? '✓ Đã qua' : '○ Chưa qua'}
                      </Text>
                      <View style={{
                        marginTop: 4,
                        padding: 4,
                        backgroundColor: '#E3F2FD',
                        borderRadius: 4
                      }}>
                        <Text style={{ fontSize: 10 }}>
                          Trip ID: {stop.trip.substring(0, 8)}...
                        </Text>
                      </View>
                    </View>
                  </Callout>
                </Marker>
              );
            })}

            {/* Polyline connecting shared stops in order */}
            {sharedItineraryStops && sharedItineraryStops.length > 1 && (
              <Polyline
                coordinates={sharedItineraryStops
                  .sort((a, b) => a.order - b.order)
                  .map(stop => ({
                    latitude: stop.point.position.lat,
                    longitude: stop.point.position.lng,
                  }))}
                strokeWidth={3}
                strokeColor="#3F51B5" // Indigo color for shared route
                lineDashPattern={[5, 5]} // Dashed line
              />
            )}

            {/* Indicator for shared route when shared stops are shown */}
            {sharedItineraryStops && sharedItineraryStops.length > 0 && (
              <View style={{
                position: 'absolute',
                bottom: 80,
                alignSelf: 'center',
                backgroundColor: 'rgba(33, 150, 243, 0.9)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  fontSize: 12,
                }}>
                  Chuyến ghép: {sharedItineraryStops.length} điểm dừng
                </Text>
              </View>
            )}
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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải vị trí...</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              console.log('Retrying location access');
            }}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MapComponent;