import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import NotificationCard from '~/components/NotificationCard';
import { useNotification } from '~/context/NotificationContext';

export default function NotificationScreen() {
  const { notifications, unreadCount } = useNotification();

  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Không có thông báo nào.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.unreadCountText}>Số thông báo chưa đọc: {unreadCount}</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <NotificationCard notification={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  unreadCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});