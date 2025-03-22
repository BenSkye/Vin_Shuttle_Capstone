import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    header: {
      padding: 16,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#eeeeee',
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
    },
    list: {
      paddingVertical: 8,
    },
    conversationItem: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    unreadItem: {
      backgroundColor: '#f0f7ff',
    },
    avatarContainer: {
      marginRight: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    avatarFallback: {
      backgroundColor: '#0084ff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitials: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    senderName: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
    },
    timeText: {
      fontSize: 12,
      color: '#8e8e8e',
      marginLeft: 8,
    },
    messageRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    messagePreview: {
      fontSize: 14,
      color: '#686868',
      flex: 1,
    },
    unreadText: {
      fontWeight: '600',
      color: '#000000',
    },
    unreadIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#00C000',
      marginLeft: 8,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: '#8e8e8e',
      textAlign: 'center',
    },
    errorText: {
      fontSize: 18,
      color: '#333',
      fontWeight: 'bold',
      marginTop: 16,
    },
    errorSubtext: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      marginTop: 8,
    },
    retryButton: {
      marginTop: 24,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: '#007bff',
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },
  });