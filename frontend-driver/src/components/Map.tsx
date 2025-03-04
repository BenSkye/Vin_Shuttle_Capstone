// src/components/MapComponent.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useLocation } from '~/context/LocationContext';
import { Position } from '~/interface/trip';

const MapComponent = ({
    pickupLocation,
    detinateLocation
}: {
    pickupLocation: Position,
    detinateLocation?: Position
}) => {
    const { location, errorMsg } = useLocation(); // Lấy vị trí từ context
    const [pickup, setPickup] = React.useState<any | null>(null);
    const [detinate, setDetinate] = React.useState<any | null>(null);
    useEffect(() => {
        if (pickupLocation) {
            setPickup({ latitude: pickupLocation.lat, longitude: pickupLocation.lng });
        }
        if (detinateLocation) {
            setDetinate({ latitude: detinateLocation?.lat, longitude: detinateLocation?.lng });
        }
    }, [pickupLocation, detinateLocation]);
    return (
        <View style={styles.container}>
            {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
            ) : location ? (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 10.8418, // Giá trị mặc định
                        longitude: 106.8370,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    region={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    provider={undefined}
                    rotateEnabled={false}
                >
                    <UrlTile
                        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        shouldReplaceMapContent={true}
                        maximumZ={19}
                        tileSize={512}
                        flipY={false}
                    />
                    <Marker coordinate={location} title="Vị trí tài xế" >
                    </Marker>
                    <Marker coordinate={pickup} title="Điểm đón" />
                    {detinate != null && (
                        <Marker coordinate={detinate} title="Điểm đến" />
                    )}
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