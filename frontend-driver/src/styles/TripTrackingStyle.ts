import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        paddingTop: 40, // To account for safe area
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30, // Extra padding at bottom for safe area
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    tripHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    tripTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tripTypeText: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E88E5',
    },
    tripId: {
        fontSize: 12,
        color: '#757575',
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    customerAvatarContainer: {
        marginRight: 10,
    },
    customerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E88E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    customerInitial: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    customerPhone: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    customerTime: {
        fontSize: 13,
        color: '#4CAF50',
        marginTop: 2,
    },
    customerAddress: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
        flexShrink: 1,
    },
    // New styles for destination info
    destinationContainer: {
        backgroundColor: '#FFF8E1',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#FF5722',
    },
    destinationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    destinationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF5722',
        marginLeft: 4,
    },
    destinationAddress: {
        fontSize: 13,
        color: '#333',
        marginLeft: 22,
    },
    destinationDistance: {
        fontSize: 12,
        color: '#757575',
        marginTop: 4,
        marginLeft: 22,
    },
    actionButtonContainer: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: '#1E88E5',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalBody: {
        padding: 20,
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        width: '30%',
        fontWeight: '500',
        color: '#666',
    },
    infoValue: {
        width: '70%',
        color: '#333',
    },
});