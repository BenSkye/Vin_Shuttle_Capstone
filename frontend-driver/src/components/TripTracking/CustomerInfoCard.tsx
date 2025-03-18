import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '~/styles/TripTrackingStyle';
import { Trip, BookingHourPayloadDto, BookingDestinationPayloadDto } from '~/interface/trip';
import { ServiceType } from '~/constants/service-type.enum';

interface CustomerInfoCardProps {
  trip: Trip;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onViewMorePress: () => void;
}

const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({
  trip,
  isCollapsed,
  onToggleCollapse,
  onViewMorePress,
}) => {
  return (
    <View style={styles.customerContainer}>
      <TouchableOpacity
        style={styles.customerRowHeader}
        onPress={onToggleCollapse}
      >
        <View style={styles.customerAvatarContainer}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerInitial}>
              {trip.customerId?.name ? trip.customerId.name.charAt(0).toUpperCase() : 'K'}
            </Text>
          </View>
        </View>
        <View style={styles.customerHeaderInfo}>
          <Text style={styles.customerName}>{trip.customerId?.name || 'N/A'}</Text>
          <Text style={styles.customerPhone}>{trip.customerId?.phone || 'N/A'}</Text>
        </View>
        <TouchableOpacity onPress={onToggleCollapse}>
          <MaterialIcons
            name={isCollapsed ? "keyboard-arrow-down" : "keyboard-arrow-up"}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={styles.customerDetails}>
          {trip.serviceType === ServiceType.BOOKING_HOUR && (
            <Text style={styles.customerTime}>
              Thời gian thuê xe:{' '}
              {(trip.servicePayload as BookingHourPayloadDto).bookingHour.totalTime} phút
            </Text>
          )}
          <Text style={styles.customerAddress}>
            {trip.serviceType === ServiceType.BOOKING_HOUR
              ? `Địa chỉ đón: ${(trip.servicePayload as BookingHourPayloadDto).bookingHour.startPoint.address}`
              : trip.serviceType === ServiceType.BOOKING_DESTINATION
                ? `Điểm đón: ${(trip.servicePayload as BookingDestinationPayloadDto).bookingDestination.startPoint.address}`
                : 'N/A'}
          </Text>
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={onViewMorePress}
          >
            <Text style={styles.viewMoreText}>Xem chi tiết</Text>
            <MaterialIcons name="keyboard-arrow-right" size={18} color="#1E88E5" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CustomerInfoCard;