import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Lighter background like Messenger
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0084ff', // Facebook Messenger blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarInitials: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#0084ff', // Facebook Messenger blue
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '75%', // Slightly narrower for better appearance
  },
  myMessageContainer: {
    alignSelf: 'flex-end', // Right side for my messages
  },
  otherMessageContainer: {
    alignSelf: 'flex-start', // Left side for other messages
  },
  messageItem: {
    padding: 12,
    borderRadius: 18, // More rounded like Messenger
  },
  myMessage: {
    backgroundColor: '#0084ff', // Facebook Messenger blue
    borderBottomRightRadius: 4, // Small point on the right for my messages
  },
  otherMessage: {
    backgroundColor: '#e4e6eb', // Facebook Messenger gray
    borderBottomLeftRadius: 4, // Small point on the left for other messages
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageContent: {
    color: '#fff', // White text for blue bubbles
  },
  otherMessageContent: {
    color: '#050505', // Dark text for gray bubbles
  },
  messageTime: {
    fontSize: 11, // Smaller time text like Messenger
    marginTop: 4,
  },
  myMessageTime: {
    color: '#8a8d91',
    textAlign: 'right',
    paddingRight: 4,
  },
  otherMessageTime: {
    color: '#8a8d91',
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f2f5', // Messenger-style input background
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0084ff', // Facebook Messenger blue
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e4e6eb', // Gray when disabled
  },

  statusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusText: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 20,
  },

  timeToOpen: {
    fontWeight: 'bold',
    color: '#228be6', // Màu xanh để làm nổi bật thời gian
  },
});