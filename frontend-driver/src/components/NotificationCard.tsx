import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
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
                style={[
                    styles.card, 
                    notification.isRead ? styles.readCard : {}
                ]} 
                onPress={handlePress}
                disabled={loading}
            >
                <Text style={styles.title}>{notification.title}</Text>
                <Text style={styles.body} numberOfLines={2}>{notification.body}</Text>
                <Text style={styles.date}>{new Date(notification.createdAt).toLocaleString()}</Text>
                {!notification.isRead && <View style={styles.unreadIndicator} />}
                {loading && <View style={styles.loadingOverlay} />}
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thông báo</Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalBody}>
                            {detailNotification && (
                                <>
                                    <Text style={styles.detailTitle}>{detailNotification.title}</Text>
                                    <Text style={styles.detailDate}>
                                        {new Date(detailNotification.createdAt).toLocaleString()}
                                    </Text>
                                    <Text style={styles.detailBody}>{detailNotification.body}</Text>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

// Styles remain unchanged

const styles = StyleSheet.create({
    // ...existing styles remain unchanged
    card: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        position: 'relative',
        backgroundColor: '#fff',
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    readCard: {
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    body: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#888',
    },
    unreadIndicator: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        width: '100%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    modalBody: {
        padding: 15,
        maxHeight: 500,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    detailDate: {
        fontSize: 12,
        color: '#888',
        marginBottom: 16,
    },
    detailBody: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
});

export default NotificationCard;