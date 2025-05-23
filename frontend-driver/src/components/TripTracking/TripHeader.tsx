import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '~/styles/TripTrackingStyle';
import { tripStatusText, TripStatus } from '~/constants/trip.enum';

interface TripHeaderProps {
  tripStatus: TripStatus;
  onBack: () => void;
}

const TripHeader = ({ tripStatus, onBack }: TripHeaderProps) => {
  return (
    <View style={styles.headerBar}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={{ color: '#fff', marginLeft: 12, fontSize: 16 }}>
        Trạng thái: {tripStatusText[tripStatus]}
      </Text>
    </View>
  );
};

export default TripHeader;
