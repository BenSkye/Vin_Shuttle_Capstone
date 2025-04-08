import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { styles } from '~/styles/TripTrackingStyle';
import { ServiceType } from '~/constants/service-type.enum';

interface TripTypeInfoProps {
  serviceType: string;
}

const TripTypeInfo = ({ serviceType }: TripTypeInfoProps) => {
  return (
    <View style={styles.tripHeader}>
      <View style={styles.tripTypeContainer}>
        <FontAwesome5 name="car" size={16} color="#1E88E5" />
        <Text style={styles.tripTypeText}>
          {serviceType === ServiceType.BOOKING_HOUR
            ? 'Đặt xe theo giờ'
            : serviceType === ServiceType.BOOKING_DESTINATION
              ? 'Đặt xe theo điểm đến'
              : serviceType === ServiceType.BOOKING_SCENIC_ROUTE
                ? 'Đặt xe theo tuyến cố định'
                : serviceType === ServiceType.BOOKING_SHARE
                  ? 'Đặt xe chia sẻ'
                  : 'Cuốc xe'}
        </Text>
      </View>
    </View>
  );
};

export default TripTypeInfo;
