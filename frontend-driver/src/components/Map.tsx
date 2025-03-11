import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { useLocation } from '~/context/LocationContext';
import { Position } from '~/interface/trip';
import { imgAccess } from '~/constants/imgAccess';
import { Ionicons } from '@expo/vector-icons';

const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

const MapComponent = ({
    pickupLocation,
    detinateLocation,
    showRouteToDestination = false
}: {
    pickupLocation: Position,
    detinateLocation?: Position | null,
    showRouteToDestination?: boolean
}) => {
    const { location, errorMsg, isTracking } = useLocation();
    const mapRef = useRef<MapView | null>(null);
    const [pickup, setPickup] = useState<{ latitude: number; longitude: number } | null>(null);
    const [detinate, setDetinate] = useState<{ latitude: number; longitude: number } | null>(null);
    const [routeToPickupCoordinates, setRouteToPickupCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [routeToDestinationCoordinates, setRouteToDestinationCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [routeError, setRouteError] = useState<string | null>(null);
    const [locationTimestamp, setLocationTimestamp] = useState<Date | null>(null);

    useEffect(() => {
        if (pickupLocation && pickupLocation.lat && pickupLocation.lng) {
            setPickup({ latitude: pickupLocation.lat, longitude: pickupLocation.lng });
            
            // Log pickup location
            console.log("Set pickup location:", {
                lat: pickupLocation.lat,
                lng: pickupLocation.lng
            });
        }
        if (detinateLocation && detinateLocation.lat && detinateLocation.lng) {
            setDetinate({ latitude: detinateLocation.lat, longitude: detinateLocation.lng });
            
            // Log destination location
            console.log("Set destination location:", {
                lat: detinateLocation.lat,
                lng: detinateLocation.lng
            });
        } else {
            setDetinate(null);
        }
    }, [pickupLocation, detinateLocation]);

    // Update timestamp when location changes
    useEffect(() => {
        if (location) {
            setLocationTimestamp(new Date());
        }
    }, [location]);

    // Fit map to include all relevant points (driver, pickup, and destination if available)
    useEffect(() => {
        if (location && mapRef.current) {
            const points = [
                { latitude: location.latitude, longitude: location.longitude }
            ];
            
            if (pickup) points.push(pickup);
            if (detinate) points.push(detinate);
            
            // Only fit bounds if we have multiple points
            if (points.length > 1) {
                mapRef.current.fitToCoordinates(points, {
                    edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                    animated: true,
                });
            } else {
                // If only driver location, center on that
                mapRef.current.animateToRegion({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
            }
        }
    }, [location, pickup, detinate]);

    // Get route from driver to pickup
    useEffect(() => {
        if (location && pickup && pickup.latitude && pickup.longitude && !showRouteToDestination) {
            fetchRoute(
                { latitude: location.latitude, longitude: location.longitude },
                pickup,
                setRouteToPickupCoordinates
            );
        }
    }, [location, pickup, showRouteToDestination]);

    // Get route from driver to destination when in destination mode
    useEffect(() => {
        if (location && detinate && detinate.latitude && detinate.longitude && showRouteToDestination) {
            fetchRoute(
                { latitude: location.latitude, longitude: location.longitude },
                detinate,
                setRouteToDestinationCoordinates
            );
            
            // Clear the pickup route when showing route to destination
            setRouteToPickupCoordinates([]);
        }
    }, [location, detinate, showRouteToDestination]);

    // Helper function to fetch routes
    const fetchRoute = async (
        from: { latitude: number; longitude: number },
        to: { latitude: number; longitude: number },
        setRouteCoordinates: React.Dispatch<React.SetStateAction<{ latitude: number; longitude: number }[]>>
    ) => {
        // Reset errors
        setRouteError(null);
        
        // Validate coordinates
        if (!isValidCoordinate(from.latitude, from.longitude) || 
            !isValidCoordinate(to.latitude, to.longitude)) {
            console.log("Invalid coordinates:", { from, to });
            setRouteError("Invalid coordinates");
            return;
        }
        
        const url = `${OSRM_API}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?geometries=geojson`;
        
        console.log("Fetching route:", url);
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.routes) {
                console.log("Invalid OSRM response data:", data);
                setRouteError("Invalid route data received");
                return;
            }
            
            if (data.routes.length > 0 && data.routes[0].geometry && data.routes[0].geometry.coordinates) {
                const coordinates = data.routes[0].geometry.coordinates.map((coord: number[]) => ({
                    latitude: coord[1],
                    longitude: coord[0],
                }));
                
                console.log(`Route found with ${coordinates.length} points`);
                setRouteCoordinates(coordinates);
            } else {
                console.log("No route found in data:", data);
                setRouteError("No route found");
            }
        } catch (error) {
            console.error("Error fetching route data:", error);
            setRouteError(`Failed to load route: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    // Helper to validate coordinates
    const isValidCoordinate = (lat: number, lng: number): boolean => {
        return !isNaN(lat) && !isNaN(lng) && 
               lat !== 0 && lng !== 0 && // Check if not default values
               Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
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
                            longitude: location.longitude || 106.8370,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        ref={mapRef}
                        provider={undefined}
                        rotateEnabled={true}
                    >
                        <UrlTile
                            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            shouldReplaceMapContent={true}
                            maximumZ={25}
                            tileSize={512}
                            flipY={false}
                        />
                        
                        {/* Route to pickup point - blue */}
                        {routeToPickupCoordinates.length > 0 && !showRouteToDestination && (
                            <Polyline
                                coordinates={routeToPickupCoordinates}
                                strokeWidth={4}
                                strokeColor="#1E88E5"
                                lineDashPattern={[0]}
                            />
                        )}
                        
                        {/* Route to destination - orange */}
                        {routeToDestinationCoordinates.length > 0 && showRouteToDestination && (
                            <Polyline
                                coordinates={routeToDestinationCoordinates}
                                strokeWidth={4}
                                strokeColor="#FF5722"
                                lineDashPattern={[0]}
                            />
                        )}

                        {/* Marker cho vị trí hiện tại */}
                        <Marker.Animated
                            coordinate={{ 
                                latitude: location.latitude, 
                                longitude: location.longitude 
                            }}
                            title="Vị trí tài xế"
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <Image
                                source={imgAccess.busTopView}
                                style={{
                                    width: 40,
                                    height: 40,
                                    transform: [{ rotate: `${location.heading !== null ? location.heading : 0}deg` }]
                                }}
                                resizeMode='contain'
                            />
                        </Marker.Animated>

                        {/* Marker cho điểm đón - only show if not in destination routing mode */}
                        {pickup && isValidCoordinate(pickup.latitude, pickup.longitude) && (!showRouteToDestination) && (
                            <Marker 
                                coordinate={pickup} 
                                title="Điểm đón"
                                pinColor="#4CAF50"
                            />
                        )}

                        {/* Marker cho điểm đến */}
                        {detinate && isValidCoordinate(detinate.latitude, detinate.longitude) && (
                            <Marker 
                                coordinate={detinate} 
                                title="Điểm đến"
                                pinColor="#FF5722"
                            />
                        )}
                    </MapView>
                    
                    {/* Location status indicator */}
                    <View style={styles.locationStatusBar}>
                        <View style={[
                            styles.statusIndicator,
                            {backgroundColor: isTracking ? '#4CAF50' : '#F44336'}
                        ]}>
                            <Ionicons 
                                name={isTracking ? "location" : "location-outline"} 
                                size={14} 
                                color="#fff" 
                            />
                        </View>
                        <Text style={styles.locationStatusText}>
                            {isTracking ? `Vị trí đang được cập nhật (${formatTimestamp()})` : 'Vị trí không được cập nhật'}
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
                            // This is a placeholder - the actual retry logic is in LocationContext
                            // But showing a button gives users a sense of control
                            console.log('Retrying location access');
                        }}
                    >
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
        color: '#333',
    },
    retryButton: {
        backgroundColor: '#1E88E5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 4,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    errorBanner: {
        position: 'absolute',
        top: 10,
        left: 10, 
        right: 10,
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 5,
    },
    errorBannerText: {
        color: 'white',
        textAlign: 'center',
    },
    routeIndicator: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 87, 34, 0.9)',
        padding: 8,
        borderRadius: 20,
    },
    routeIndicatorText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    locationStatusBar: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    statusIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    locationStatusText: {
        fontSize: 12,
        color: '#333',
    }
});

export default MapComponent;