import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useConversationSocket from '~/hook/useConversationSocket';
import { IConversation } from '~/interface/conversation';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { styles } from '~/styles/ConversationStyle';
export default function ConversationScreen() {
  const navigation = useNavigation();
  const { data: conversations, isLoading, error, refreshData } = useConversationSocket();
  const [refreshing, setRefreshing] = useState(false);

  const handleConversationPress = (conversationId: string) => {
    navigation.navigate('ConversationDetail', { conversationId });
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderItem = ({ item }: { item: IConversation }) => {
    const sender = item.customerId;
    const unread = false; // Add logic for unread messages if available
    const time = item.lastMessage?.createdAt ? formatTime(item.lastMessage.createdAt) : '';

    return (
      <TouchableOpacity
        style={[styles.conversationItem, unread && styles.unreadItem]}
        onPress={() => handleConversationPress(item._id.toString())}
        activeOpacity={0.8}>
        <View style={styles.avatarContainer}>
          {sender.avatar ? (
            <Image source={{ uri: sender.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitials}>{getInitials(sender.name)}</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text numberOfLines={1} style={[styles.senderName, unread && styles.unreadText]}>
              {sender.name || 'Khách hàng'}
            </Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
          <View style={styles.headerRow}>
            <Text numberOfLines={1} style={[styles.tripIdText, unread && styles.unreadText]}>
              Cuốc xe {item.tripId ? String(item.tripId._id) : ''}
            </Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>

          <View style={styles.messageRow}>
            <Text numberOfLines={1} style={[styles.messagePreview, unread && styles.unreadText]}>
              {item.lastMessage?.content || 'Chưa có tin nhắn'}
            </Text>
            {unread && <View style={styles.unreadIndicator} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch fresh data from API
      await refreshData();
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff3b30" />
        <Text style={styles.errorText}>Đã có lỗi xảy ra</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const conversationsArray = conversations as IConversation[];

  if (!conversationsArray || conversationsArray.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
        </View>
        <FlatList
          data={[]}
          renderItem={() => null}
          ListEmptyComponent={() => (
            <View style={styles.centerContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={70} color="#cccccc" />
              <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
            </View>
          )}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007bff']}
              tintColor="#007bff"
              title="Đang tải..."
              titleColor="#007bff"
              progressBackgroundColor="#ffffff"
            />
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
      </View>

      <FlatList
        data={conversationsArray}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ flexGrow: 1 }}
        ListHeaderComponent={<View style={{ height: 1 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007bff']}
            tintColor="#007bff"
            title="Đang tải..."
            titleColor="#007bff"
            progressBackgroundColor="#ffffff"
          />
        }
      />
    </SafeAreaView>
  );
}
