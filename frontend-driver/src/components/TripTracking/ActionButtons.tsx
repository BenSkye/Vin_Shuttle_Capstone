import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '~/styles/TripTrackingStyle';
import { ServiceType } from '~/constants/service-type.enum';

interface ActionButtonsProps {
  loading: boolean;
  tripStatus: string;
  serviceType: string;
  timerActive: boolean;
  isTracking: boolean;
  onPickup: () => void;
  onStartTrip: () => void;
  onCompleteTrip: () => void;
  onEarlyEnd: () => void;
  formatRemainingTime: () => string;
}

const ActionButtons = ({
  loading,
  tripStatus,
  serviceType,
  timerActive,
  isTracking,
  onPickup,
  onStartTrip,
  onCompleteTrip,
  onEarlyEnd,
  formatRemainingTime,
}: ActionButtonsProps) => {
  if (loading) {
    return (
      <View style={styles.actionButtonContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  const status = tripStatus.toLowerCase();

  switch (status) {
    case 'assigned':
      return (
        <TouchableOpacity style={styles.actionButton} onPress={onPickup} disabled={!isTracking}>
          <MaterialIcons name="person" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Đón khách</Text>
        </TouchableOpacity>
      );
    case 'pickup':
      return (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={onStartTrip}
          disabled={!isTracking}>
          <MaterialIcons name="play-arrow" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Bắt đầu chuyến đi</Text>
        </TouchableOpacity>
      );
    case 'in_progress':
      if (serviceType === ServiceType.BOOKING_HOUR && timerActive) {
        return (
          <View style={styles.timerActionContainer}>
            <View style={styles.timerContainer}>
              <MaterialIcons name="timer" size={20} color="#FF5722" />
              <Text style={styles.timerText}>{formatRemainingTime()}</Text>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF5722' }]}
              onPress={onEarlyEnd}
              disabled={!isTracking}>
              <MaterialIcons name="done" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Kết thúc sớm</Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        return (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF5722' }]}
            onPress={onCompleteTrip}
            disabled={!isTracking}>
            <MaterialIcons name="done" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Hoàn thành chuyến đi</Text>
          </TouchableOpacity>
        );
      }
    case 'completed':
      return (
        <View style={[styles.actionButton, { backgroundColor: '#8BC34A' }]}>
          <MaterialIcons name="check-circle" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Chuyến đi đã hoàn thành</Text>
        </View>
      );
    default:
      return null;
  }
};

export default ActionButtons;
