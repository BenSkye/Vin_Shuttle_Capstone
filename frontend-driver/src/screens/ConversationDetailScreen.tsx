import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAuth } from '~/context/AuthContext';
import useConversationSocket from '~/hook/useConversationSocket';
import { IConversation, IMessage } from '~/interface/conversation';
import { styles } from '~/styles/ConversationDetailStyle';

export default function ConversationDetailScreen({ route }: { route: any }) {
  const { conversationId } = route.params;
  const {
    data: conversation,
    isLoading,
    error,
    sendMessage,
  } = useConversationSocket(conversationId);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(conversationId, message);
      setMessage('');
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversation && (conversation as IConversation)?.listMessage?.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [conversation]);

  const formatMessageTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch (error) {
      return '';
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

  const renderItem = ({ item }: { item: IMessage }) => {
    const isMyMessage = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}>
        <View style={[styles.messageItem, isMyMessage ? styles.myMessage : styles.otherMessage]}>
          <Text
            style={[
              styles.messageContent,
              isMyMessage ? styles.myMessageContent : styles.otherMessageContent,
            ]}>
            {item.content}
          </Text>
        </View>
        <Text
          style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
          ]}>
          {formatMessageTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  // Get the customer info to display in header
  const customerInfo = conversation ? (conversation as IConversation).customerId : null;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0084ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff3b30" />
        <Text style={styles.errorText}>Đã có lỗi xảy ra</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {customerInfo && (
          <View style={styles.headerInfo}>
            <View style={styles.headerAvatar}>
              {customerInfo.avatar ? (
                <Image source={{ uri: customerInfo.avatar }} style={styles.headerAvatarImage} />
              ) : (
                <View style={styles.headerAvatarFallback}>
                  <Text style={styles.headerAvatarInitials}>{getInitials(customerInfo.name)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerName}>{customerInfo.name || 'Khách hàng'}</Text>
          </View>
        )}
      </View>

      {/* Chat area */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}>
        <FlatList
          ref={flatListRef}
          data={(conversation as IConversation)?.listMessage || []}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#888"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim()}>
            <Ionicons name="send" size={20} color={message.trim() ? '#fff' : '#cacaca'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
