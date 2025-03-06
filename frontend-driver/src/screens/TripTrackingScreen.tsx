import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
// import useTrackingSocket from '@/hooks/useTrackingSocket';
import MapComponent from '~/components/Map';
import { ServiceType } from '~/constants/service-type.enum';
import { BookingHourPayloadDto, Position, Trip } from '~/interface/trip';

// interface TripTrackingProps {
//     vehicleId: string;
// }

const TripTrackingScreen = () => {
    const route = useRoute();
    const [customerPickupLocation, setCustomerPickupLocation] = useState<Position>({ lat: 0, lng: 0 });
    const trip = route.params?.trip as Trip;

    useEffect(() => {
        if (trip.serviceType = ServiceType.BOOKING_HOUR) {
            setCustomerPickupLocation((trip.servicePayload as BookingHourPayloadDto).bookingHour.startPoint.position)
        }
    }, [trip]);

    if (!route.params) {
        return (
            <View style={styles.container}>
                <Text className="p-2 text-gray-800">No vehicle ID provided</Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Text className="p-2 text-gray-800">chuyến xe: {trip._id}</Text>
            <MapComponent pickupLocation={customerPickupLocation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default TripTrackingScreen;
