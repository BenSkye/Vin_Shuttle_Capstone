import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
// import useTrackingSocket from '@/hooks/useTrackingSocket';
import MapComponent from '~/components/Map';

// interface TripTrackingProps {
//     vehicleId: string;
// }

const TripTrackingScreen = () => {
    const route = useRoute();
    const vehicleId = route.params?.vehicleId;

    if (!route.params) {
        return (
            <View style={styles.container}>
                <Text className="p-2 text-gray-800">No vehicle ID provided</Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Text className="p-2 text-gray-800">Đang theo dõi phương tiện: {vehicleId}</Text>
            <MapComponent />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default TripTrackingScreen;
