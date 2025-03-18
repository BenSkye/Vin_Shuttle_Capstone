import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  unreadCountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E88E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  markAllButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  markAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});