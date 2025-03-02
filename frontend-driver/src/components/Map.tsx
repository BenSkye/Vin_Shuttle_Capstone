import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, UrlTile } from 'react-native-maps';

const MapComponent = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const getLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Quyền truy cập vị trí bị từ chối!');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        };

        getLocation();

        // Cập nhật vị trí mỗi 3 giây
        const interval = setInterval(getLocation, 3000);
        return () => clearInterval(interval);
    }, []);

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
                    region={location ? {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    } : undefined}
                    mapType="none"
                >
                    <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maximumZ={19}
                    />
                    (location? <Marker coordinate={location} title="Vị trí tài xế" />:<></>)
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