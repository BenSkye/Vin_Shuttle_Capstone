import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import NotificationCard from '~/components/NotificationCard';
import { useNotification } from '~/context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationScreen() {
  const { notifications, unreadCount, markAllAsRead, refreshNotifications } = useNotification();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sort notifications by date (newest first)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return; // Don't do anything if there are no unread notifications

    setLoading(true);
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 mt-6 bg-gray-100">
      <View className="flex-1 px-4 pt-2">
        {/* Header with unread count and mark all as read button */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-base font-semibold text-gray-800">
              {unreadCount > 0 ? (
                <>Thông báo chưa đọc: <Text className="text-blue-500">{unreadCount}</Text></>
              ) : (
                'Tất cả thông báo đã đọc'
              )}
            </Text>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              className={`flex-row items-center rounded-full ${loading ? 'bg-blue-300' : 'bg-blue-500'} px-4 py-2`}
              onPress={handleMarkAllRead}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                  <Text className="ml-1 text-sm font-medium text-white">Đọc tất cả</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Notification list */}
        {notifications.length > 0 ? (
          <FlatList
            data={sortedNotifications}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <NotificationCard notification={item} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#1877F2"]}
                tintColor="#1877F2"
              />
            }
            className="pt-1"
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="notifications-off-outline" size={48} color="#d1d5db" />
            <Text className="mt-4 text-base text-gray-500">Không có thông báo nào.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
