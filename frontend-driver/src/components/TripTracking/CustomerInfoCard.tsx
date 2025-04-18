import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Animated } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles as trackingStyles } from '~/styles/TripTrackingStyle';
import { Trip, BookingHourPayloadDto, BookingDestinationPayloadDto, BookingSharePayloadDto } from '~/interface/trip';
import { ServiceType } from '~/constants/service-type.enum';
import { getPersonalConversations } from '~/services/conversationService';

interface CustomerInfoCardProps {
  trip: Trip;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onViewMorePress: () => void;
  hasNewMessage?: boolean;
  onChatOpened?: () => void;
}

const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({
  trip,
  isCollapsed,
  onToggleCollapse,
  onViewMorePress,
  hasNewMessage = false,
  onChatOpened,
}) => {
  const navigation = useNavigation();
  const [isChatLoading, setIsChatLoading] = useState(false);
  const blinkAnim = new Animated.Value(1); // Animation value for opacity

  // Blinking animation
  useEffect(() => {
    if (hasNewMessage) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.4,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      blinkAnim.setValue(1); // Reset opacity
    }
  }, [hasNewMessage]);

  const handleChatPress = async () => {
    if (isChatLoading) return;

    try {
      setIsChatLoading(true);
      onChatOpened?.(); // Reset blinking state

      // Check if trip.conversationId exists
      if (trip.conversationId) {
        navigation.navigate('ConversationDetail', { conversationId: trip.conversationId });
        return;
      }

      // Fetch all personal conversations and find the one matching trip._id
      const conversations = await getPersonalConversations();
      console.log('Conversations:', conversations);
      console.log('Trip ID:', trip._id);

      const matchingConversation = conversations.find(
        (conv: any) => conv.tripId === trip._id || conv.tripId._id === trip._id
      );

      if (matchingConversation?._id) {
        navigation.navigate('ConversationDetail', { conversationId: matchingConversation._id });
      } else {
        Alert.alert('Thông báo', 'Chưa có cuộc trò chuyện cho chuyến đi này.');
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      Alert.alert('Lỗi', 'Không thể tải cuộc trò chuyện. Vui lòng thử lại.');
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <View style={trackingStyles.customerContainer}>
      <View style={trackingStyles.customerRowHeader}>
        <View style={trackingStyles.customerAvatarContainer}>
          <View style={trackingStyles.customerAvatar}>
            <Text style={trackingStyles.customerInitial}>
              {trip.customerId?.name ? trip.customerId.name.charAt(0).toUpperCase() : 'K'}
            </Text>
          </View>
        </View>
        <View style={trackingStyles.customerHeaderInfo}>
          <Text style={trackingStyles.customerName}>{trip.customerId?.name || 'N/A'}</Text>
          <Text style={trackingStyles.customerPhone}>{trip.customerId?.phone || 'N/A'}</Text>
          <Text style={trackingStyles.tripId}>{trip.code || 'N/A'}</Text>
        </View>
      </View>

      {!isCollapsed && (
        <View style={trackingStyles.customerDetails}>
          {trip.serviceType === ServiceType.BOOKING_HOUR && (
            <Text style={trackingStyles.customerTime}>
              Thời gian thuê xe:{' '}
              {(trip.servicePayload as BookingHourPayloadDto).bookingHour.totalTime} phút
            </Text>
          )}
          {trip.serviceType === ServiceType.BOOKING_SHARE && (
            <View>
              <Text style={trackingStyles.customerAddress}>
                Điểm đón: {(trip.servicePayload as BookingSharePayloadDto).bookingShare.startPoint.address}
              </Text>
              <Text style={trackingStyles.customerAddress}>
                Điểm trả: {(trip.servicePayload as BookingSharePayloadDto).bookingShare.endPoint.address}
              </Text>
            </View>
          )}
          {(trip.serviceType === ServiceType.BOOKING_HOUR || trip.serviceType === ServiceType.BOOKING_DESTINATION) && (
            <Text style={trackingStyles.customerAddress}>
              {trip.serviceType === ServiceType.BOOKING_HOUR
                ? `Địa chỉ đón: ${(trip.servicePayload as BookingHourPayloadDto).bookingHour.startPoint.address}`
                : trip.serviceType === ServiceType.BOOKING_DESTINATION
                  ? `Điểm đón: ${(trip.servicePayload as BookingDestinationPayloadDto).bookingDestination.startPoint.address}`
                  : 'N/A'}
            </Text>
          )}

          <View style={trackingStyles.buttonContainer}>
            <TouchableOpacity style={trackingStyles.viewMoreButton} onPress={onViewMorePress}>
              <Text style={trackingStyles.viewMoreText}>Xem chi tiết</Text>
              <MaterialIcons name="keyboard-arrow-right" size={18} color="#1E88E5" />
            </TouchableOpacity>
            <Animated.View style={{ opacity: blinkAnim }}>
              <TouchableOpacity
                style={[
                  trackingStyles.chatButton,
                  isChatLoading && trackingStyles.chatButtonDisabled,
                ]}
                onPress={handleChatPress}
                disabled={isChatLoading}
              >
                <Text style={trackingStyles.viewMoreText}>
                  {isChatLoading ? 'Đang tải...' : 'Chat với khách hàng'}
                </Text>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color="#1E88E5"
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CustomerInfoCard;