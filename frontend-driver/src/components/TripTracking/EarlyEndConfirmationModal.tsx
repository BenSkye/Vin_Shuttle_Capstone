import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '~/styles/TripTrackingStyle';

interface EarlyEndConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  remainingTimeFormatted: string;
}

const EarlyEndConfirmationModal: React.FC<EarlyEndConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  remainingTimeFormatted,
}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.confirmationModal}>
          <View style={styles.confirmationHeader}>
            <MaterialIcons name="warning" size={28} color="#FF9800" />
            <Text style={styles.confirmationTitle}>Kết thúc chuyến sớm</Text>
          </View>

          <View style={styles.confirmationBody}>
            <Text style={styles.confirmationText}>
              Bạn còn {remainingTimeFormatted} phút trong thời gian thuê xe. Bạn có chắc chắn muốn
              kết thúc chuyến đi sớm không?
            </Text>
          </View>

          <View style={styles.confirmationButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>Kết thúc</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EarlyEndConfirmationModal;
