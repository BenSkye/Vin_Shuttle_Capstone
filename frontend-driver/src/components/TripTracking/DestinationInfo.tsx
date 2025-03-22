import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '~/styles/TripTrackingStyle';
import { ServiceType } from '~/constants/service-type.enum';
import { BookingDestinationPayloadDto } from '~/interface/trip';

interface DestinationInfoProps {
  serviceType: string;
  servicePayload: any;
  showDestination: boolean;
  routeToDestination: boolean;
  onToggleRouteDestination: () => void;
}

const DestinationInfo = ({
  serviceType,
  servicePayload,
  showDestination,
  routeToDestination,
  onToggleRouteDestination
}: DestinationInfoProps) => {
  if (serviceType !== ServiceType.BOOKING_DESTINATION || !showDestination) {
    return null;
  }

  const payload = servicePayload as BookingDestinationPayloadDto;
  
  return (
    <TouchableOpacity
      style={[styles.destinationContainer, routeToDestination ? styles.activeDestination : {}]}
      onPress={onToggleRouteDestination}>
      <View style={styles.destinationHeader}>
        <MaterialIcons name="location-on" size={18} color="#FF5722" />
        <Text style={styles.destinationTitle}>Điểm đến</Text>
        <View style={styles.routeToggle}>
          <Text style={styles.routeToggleText}>
            {routeToDestination ? 'Đang hiển thị lộ trình' : 'Nhấn để xem lộ trình'}
          </Text>
        </View>
      </View>
      <Text style={styles.destinationAddress}>
        {payload.bookingDestination.endPoint.address}
      </Text>
      {payload.bookingDestination.distanceEstimate && (
        <Text style={styles.destinationDistance}>
          Khoảng cách: {(payload.bookingDestination.distanceEstimate / 1000).toFixed(1)} km
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default DestinationInfo;