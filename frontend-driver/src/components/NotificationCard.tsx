import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import { INotification } from '~/interface/notification';
import { markNotificationAsRead, getNotificationDetail } from '~/services/notificationService';
import { useNotification } from '~/context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

interface NotificationCardProps {
  notification: INotification;
}

const NotificationCard = ({ notification }: NotificationCardProps) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [detailNotification, setDetailNotification] = React.useState<INotification | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { updateNotificationReadStatus } = useNotification();

  const handlePress = async () => {
    try {
      setLoading(true);

      // Get notification details
      const detail = await getNotificationDetail(notification._id);
      setDetailNotification(detail);

      // Mark as read if not already read
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
        // Update local state immediately
        updateNotificationReadStatus(notification._id, true);
      }

      // Show modal
      setModalVisible(true);
    } catch (error) {
      console.error('Error handling notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        className={`relative mb-2 rounded-xl p-4 ${notification.isRead
          ? 'bg-white border border-gray-100'
          : 'bg-[#e7f4fd] border border-blue-200'
          } shadow-sm`}
        onPress={handlePress}
        disabled={loading}
      >
        <View className="flex-row items-start space-x-3">
          {/* Avatar/Icon placeholder - can be replaced with actual user avatar if available */}


          <View className="flex-1">
            <Text className="mb-1 font-medium text-gray-900">{notification.title}</Text>
            <Text className="mb-1 text-sm text-gray-600" numberOfLines={2}>
              {notification.body}
            </Text>
            <Text className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleString()}
            </Text>
          </View>

          {/* Unread indicator */}
          {!notification.isRead && (
            <View className="h-3 w-3 rounded-full bg-blue-500" />
          )}
        </View>

        {loading && (
          <View className="absolute inset-0 items-center justify-center rounded-xl bg-gray-100/70">
            <Ionicons name="sync" size={24} color="#1877F2" className="animate-spin" />
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setModalVisible(false)}
        >
          <View className="flex-1 items-center justify-center p-4">
            <Pressable className="w-full max-h-[80%] rounded-xl bg-white shadow-md" onPress={e => e.stopPropagation()}>
              {/* Modal Header */}
              <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
                <Text className="text-lg font-bold text-gray-900">Thông báo</Text>
                <TouchableOpacity
                  className="rounded-full p-1 active:bg-gray-200"
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <ScrollView className="p-4">
                {detailNotification && (
                  <>
                    <Text className="mb-2 text-xl font-bold text-gray-900">{detailNotification.title}</Text>
                    <Text className="mb-4 text-xs text-gray-500">
                      {new Date(detailNotification.createdAt).toLocaleString()}
                    </Text>
                    <Text className="text-base leading-6 text-gray-800">{detailNotification.body}</Text>
                  </>
                )}
              </ScrollView>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default NotificationCard;
