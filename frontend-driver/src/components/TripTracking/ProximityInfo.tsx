import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '~/styles/TripTrackingStyle';
import { Position } from '~/interface/trip';

interface ProximityInfoProps {
  tripStatus: string;
  location: { latitude: number; longitude: number } | null;
  customerPickupLocation: Position;
}

const ProximityInfo = ({ tripStatus, location, customerPickupLocation }: ProximityInfoProps) => {
  if (tripStatus.toLowerCase() !== 'pickup' || !location || !customerPickupLocation) {
    return null;
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Haversine formula to calculate distance between two points on Earth
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };
  
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    customerPickupLocation.lat,
    customerPickupLocation.lng
  );

  const MIN_PROXIMITY = 30; // meters
  const isCloseEnough = distance <= MIN_PROXIMITY;

  return (
    <View
      style={[
        styles.proximityContainer,
        { backgroundColor: isCloseEnough ? '#E8F5E9' : '#FFF3E0' },
      ]}>
      <MaterialIcons
        name={isCloseEnough ? 'check-circle' : 'info'}
        size={18}
        color={isCloseEnough ? '#4CAF50' : '#FF9800'}
      />
      <Text style={[styles.proximityText, { color: isCloseEnough ? '#2E7D32' : '#E65100' }]}>
        {isCloseEnough
          ? `Bạn đã ở gần khách hàng (${Math.round(distance)}m)`
          : `Bạn cần di chuyển gần khách hàng hơn (hiện tại cách ${Math.round(distance)}m, cần trong vòng ${MIN_PROXIMITY}m)`}
      </Text>
    </View>
  );
};

export default ProximityInfo;