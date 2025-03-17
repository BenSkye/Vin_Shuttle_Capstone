import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { INotification } from '~/interface/notification';

interface NotificationCardProps {
    notification: INotification;
}

const NotificationCard = ({ notification }: NotificationCardProps) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.body}>{notification.body}</Text>
            <Text style={styles.date}>{new Date(notification.createdAt).toLocaleString()}</Text>
            {!notification.isRead && <View style={styles.unreadIndicator} />}
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default NotificationCard;