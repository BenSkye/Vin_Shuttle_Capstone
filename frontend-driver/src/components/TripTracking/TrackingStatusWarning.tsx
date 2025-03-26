import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '~/styles/TripTrackingStyle';

interface TrackingStatusWarningProps {
  isTracking: boolean;
}

const TrackingStatusWarning = ({ isTracking }: TrackingStatusWarningProps) => {
  if (!isTracking) {
    return (
      <View style={styles.trackingWarning}>
        <Ionicons name="warning" size={16} color="#FFA000" />
        <Text style={styles.trackingWarningText}>
          Vị trí không được cập nhật. Hãy đảm bảo GPS được bật.
        </Text>
      </View>
    );
  }
  return null;
};

export default TrackingStatusWarning;
