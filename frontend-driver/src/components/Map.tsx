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

    useEffect(() => {
        if (pickupLocation) {
            setPickup({ latitude: pickupLocation.lat, longitude: pickupLocation.lng });
        }
        if (detinateLocation) {
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
        if (location && pickup) {
            const url = `${OSRM_API}/${location.longitude},${location.latitude};${pickup.longitude},${pickup.latitude}?geometries=geojson`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.routes.length > 0) {
                        const coordinates = data.routes[0].geometry.coordinates.map((coord: number[]) => ({
                            latitude: coord[1],
                            longitude: coord[0],
                        }));
                        setRouteCoordinates(coordinates);
                    }
                })
                .catch(error => console.error("Lỗi lấy dữ liệu tuyến đường:", error));
        }
    }, [location, pickup]);

    return (
        <View style={styles.container}>
            {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
            ) : location ? (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 10.8418,
                        longitude: 106.8370,
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
                            strokeColor="blue"
                        />
                    )}

                    {/* Marker cho vị trí hiện tại */}
                    <Marker.Animated
                        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
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
                    {pickup && <Marker coordinate={pickup} title="Điểm đón" />}

                    {/* Marker cho điểm đến */}
                    {detinate && <Marker coordinate={detinate} title="Điểm đến" />}
                </MapView>
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
});

export default MapComponent;
