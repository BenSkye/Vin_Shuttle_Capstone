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
import { styles } from '~/styles/NotificationStyle';
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
    if (unreadCount === 0) return; // Không làm gì nếu không có thông báo chưa đọc

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

  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Không có thông báo nào.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.unreadCountText}>Số thông báo chưa đọc: {unreadCount}</Text>

        {/* <TouchableOpacity 
          style={[
            styles.markAllButton,
            unreadCount === 0 ? styles.markAllButtonDisabled : {}
          ]} 
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={18} color="#fff" />
              <Text style={styles.markAllButtonText}>Đọc tất cả</Text>
            </>
          )}
        </TouchableOpacity> */}
      </View>

      <FlatList
        data={sortedNotifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <NotificationCard notification={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}
