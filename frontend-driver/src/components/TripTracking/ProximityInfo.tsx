import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '~/styles/TripTrackingStyle';
import { Position } from '~/interface/trip';

interface ProximityInfoProps {
  tripStatus: string;
  location: { latitude: number; longitude: number } | null;
  customerPickupLocation: Position;
}

const ProximityInfo = ({ tripStatus, location, customerPickupLocation }: ProximityInfoProps) => {
  const calculateDistance = () => {
    if (!location || !customerPickupLocation || 
        (customerPickupLocation.lat === 0 && customerPickupLocation.lng === 0)) {
      return null;
    }

    const R = 6371000; // Earth's radius in meters
    const φ1 = (location.latitude * Math.PI) / 180;
    const φ2 = (customerPickupLocation.lat * Math.PI) / 180;
    const Δφ = ((customerPickupLocation.lat - location.latitude) * Math.PI) / 180;
    const Δλ = ((customerPickupLocation.lng - location.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const distance = calculateDistance();
  if (!distance) return null;

  return (
    <View
      style={[
        styles.proximityContainer,
        {
          backgroundColor: distance <= 30 ? '#E8F5E9' : '#FFF3E0',
          borderLeftColor: distance <= 30 ? '#4CAF50' : '#FF9800',
        },
      ]}>
      <Ionicons
        name={distance <= 30 ? 'checkmark-circle' : 'warning'}
        size={20}
        color={distance <= 30 ? '#4CAF50' : '#FF9800'}
      />
      <Text
        style={[
          styles.proximityText,
          { color: distance <= 30 ? '#2E7D32' : '#F57C00' },
        ]}>
        {distance <= 30
          ? 'Bạn đang ở gần điểm đón khách'
          : `Bạn cách điểm đón ${Math.round(distance)}m`}
      </Text>
    </View>
  );
};

export default ProximityInfo;
