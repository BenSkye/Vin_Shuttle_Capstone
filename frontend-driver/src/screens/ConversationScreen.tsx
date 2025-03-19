

// screens/ConversationList.tsx
import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import useConversationSocket from '~/hook/useConversationSocket';
import { IConversation } from '~/interface/conversation';

export default function ConversationScreen() {
  const navigation = useNavigation();
  const { data: conversations, isLoading, error } = useConversationSocket();

  const handleConversationPress = (conversationId: string) => {
    navigation.navigate('ConversationDetail', { conversationId });
  };

  useEffect(() => {
    console.log('ConversationScreen mounted');
    return () => {
      console.log('ConversationScreen unmounted');
    }
  }, []);

  const renderItem = ({ item }: { item: IConversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item._id.toString())}
    >
      <Text style={styles.conversationTitle}>
        {item.driverId.name}
      </Text>
      <Text style={styles.conversationMessage}>
        {item.lastMessage?.content || 'No messages yet'}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={(conversations as IConversation[])}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  list: {
    padding: 16,
  },
  conversationItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});