import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { useLocation } from '~/context/LocationContext';
import { Position } from '~/interface/trip';
import { imgAccess } from '~/constants/imgAccess';

const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

const MapComponent = ({
    pickupLocation,
    detinateLocation
}: {
    pickupLocation: Position,
    detinateLocation?: Position
}) => {
    const { location, errorMsg } = useLocation();
    const mapRef = useRef<MapView | null>(null);
    const [pickup, setPickup] = useState<{ latitude: number; longitude: number } | null>(null);
    const [detinate, setDetinate] = useState<{ latitude: number; longitude: number } | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [routeError, setRouteError] = useState<string | null>(null);

    useEffect(() => {
        if (pickupLocation && pickupLocation.lat && pickupLocation.lng) {
            setPickup({ latitude: pickupLocation.lat, longitude: pickupLocation.lng });
        }
        if (detinateLocation && detinateLocation.lat && detinateLocation.lng) {
            setDetinate({ latitude: detinateLocation.lat, longitude: detinateLocation.lng });
        }
    }, [pickupLocation, detinateLocation]);

    useEffect(() => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    }, [location]);

    // Gọi OSRM API để lấy tuyến đường từ vị trí hiện tại đến điểm đón
    useEffect(() => {
        if (location && pickup && pickup.latitude && pickup.longitude) {
            // Reset errors
            setRouteError(null);
            
            // Validate coordinates
            if (!isValidCoordinate(location.latitude, location.longitude) || 
                !isValidCoordinate(pickup.latitude, pickup.longitude)) {
                setRouteError("Invalid coordinates");
                return;
            }
            
            const url = `${OSRM_API}/${location.longitude},${location.latitude};${pickup.longitude},${pickup.latitude}?geometries=geojson`;
            
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Validate response data
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
                        setRouteCoordinates(coordinates);
                    } else {
                        console.log("No route found in data:", data);
                        setRouteError("No route found");
                    }
                })
                .catch(error => {
                    console.error("Error fetching route data:", error);
                    setRouteError("Failed to load route");
                });
        }
    }, [location, pickup]);

    // Helper to validate coordinates
    const isValidCoordinate = (lat: number, lng: number): boolean => {
        return !isNaN(lat) && !isNaN(lng) && 
               lat !== 0 && lng !== 0 && // Check if not default values
               Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
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
                        {/* Vẽ tuyến đường với Polyline */}
                        {routeCoordinates.length > 0 && (
                            <Polyline
                                coordinates={routeCoordinates}
                                strokeWidth={4}
                                strokeColor="#1E88E5"
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

                        {/* Marker cho điểm đón */}
                        {pickup && isValidCoordinate(pickup.latitude, pickup.longitude) && (
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
                    
                    {routeError && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>{routeError}</Text>
                        </View>
                    )}
                </View>
            ) : (
                <Text style={styles.loadingText}>Đang tải vị trí...</Text>
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
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
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
    }
});

export default MapComponent;
