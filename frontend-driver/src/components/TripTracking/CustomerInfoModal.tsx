import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '~/styles/TripTrackingStyle';
import { Trip, BookingDestinationPayloadDto, BookingHourPayloadDto } from '~/interface/trip';
import { ServiceType } from '~/constants/service-type.enum';
import { tripStatusText } from '~/constants/trip.enum';

interface CustomerInfoModalProps {
  visible: boolean;
  onClose: () => void;
  trip: Trip;
}

const CustomerInfoModal: React.FC<CustomerInfoModalProps> = ({ visible, onClose, trip }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thông tin khách hàng</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScrollContainer}
            contentContainerStyle={styles.modalBody}
            showsVerticalScrollIndicator={true}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tên:</Text>
              <Text style={styles.infoValue}>{trip.customerId?.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <Text style={styles.infoValue}>{trip.customerId?.phone || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã cuốc xe:</Text>
              <Text style={styles.infoValue}>{trip.code}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phương tiện:</Text>
              <Text style={styles.infoValue}>
                {trip.vehicleId?.name} ({trip.vehicleId?.licensePlate})
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số tiền:</Text>
              <Text style={styles.infoValue}>{trip.amount.toLocaleString('vi-VN')} VND</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trạng thái:</Text>
              <Text style={styles.infoValue}>{tripStatusText[trip.status]}</Text>
            </View>

            {trip.serviceType === ServiceType.BOOKING_DESTINATION && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Điểm đón:</Text>
                  <Text style={styles.infoValue}>
                    {
                      (trip.servicePayload as BookingDestinationPayloadDto).bookingDestination
                        .startPoint.address
                    }
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Điểm đến:</Text>
                  <Text style={styles.infoValue}>
                    {
                      (trip.servicePayload as BookingDestinationPayloadDto).bookingDestination
                        .endPoint.address
                    }
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Khoảng cách:</Text>
                  <Text style={styles.infoValue}>
                    {(
                      (trip.servicePayload as BookingDestinationPayloadDto).bookingDestination
                        .distanceEstimate / 1000
                    ).toFixed(1)}{' '}
                    km
                  </Text>
                </View>
              </>
            )}

            {trip.serviceType === ServiceType.BOOKING_HOUR && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Thời gian thuê:</Text>
                <Text style={styles.infoValue}>
                  {(trip.servicePayload as BookingHourPayloadDto).bookingHour.totalTime} phút
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CustomerInfoModal;
