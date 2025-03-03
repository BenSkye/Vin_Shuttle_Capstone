import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import useTrackingSocket from '~/hook/useTrackingSocket';

const MapComponent = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { emitLocationUpdate } = useTrackingSocket();

    useEffect(() => {
        let subscription: Location.LocationSubscription;
        const subscribeToLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Quyền truy cập vị trí bị từ chối!');
                return;
            }
            subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 1 },
                (location) => {
                    console.log('location:', location);
                    const newLocation = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };
                    setLocation(newLocation);
                    emitLocationUpdate(newLocation); // Emit the location update event
                }
            );
        };

        subscribeToLocation();

        return () => {
            subscription && subscription.remove();
        };
    }, [emitLocationUpdate]);

    useEffect(() => {
        console.log('Location:', location);
    }, [location]);

    return (
        <View style={styles.container}>
            {errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
            ) : location ? (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 10.8418, // Giá trị mặc định, ví dụ TP.HCM
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
                    {location && <Marker coordinate={location} title="Vị trí tài xế" />}
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