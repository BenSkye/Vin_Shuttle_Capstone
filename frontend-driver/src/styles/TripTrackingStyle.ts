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
        paddingTop: 10, // To account for safe area
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
        paddingBottom: 20, // Extra padding at bottom for safe area
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
    // Enhanced destination styles
    destinationContainer: {
        backgroundColor: '#FFF8E1',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#FF9800',
    },
    activeDestination: {
        backgroundColor: '#FFF3E0',
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
    routeToggle: {
        marginLeft: 'auto',
    },
    routeToggleText: {
        fontSize: 11,
        color: '#FF5722',
        fontStyle: 'italic',
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
        paddingBottom: 30, // Add additional padding at bottom
        flexGrow: 1, // Allow content to grow
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
        flexShrink: 0, // Prevent label from shrinking
    },
    infoValue: {
        width: '70%',
        color: '#333',
        flexShrink: 1, // Allow value to shrink if necessary
    },
    // Add this new style for the scroll view container
    modalScrollContainer: {
        maxHeight: '70%', // Control max height of scroll area
    },
    customerContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 8,
    },
    customerRowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    customerHeaderInfo: {
        flex: 1,
    },
    customerDetails: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: 0,
        paddingTop: 8,
    },
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    viewMoreText: {
        color: '#1E88E5',
        fontSize: 13,
        fontWeight: '500',
    },
    // New tracking warning styles
    trackingWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3CD',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#FFA000',
    },
    trackingWarningText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#856404',
    },
    proximityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
        borderLeftWidth: 3,
    },
    proximityText: {
        marginLeft: 6,
        fontSize: 13,
        flexShrink: 1,
    },
    // Add these styles
    timerActionContainer: {
        marginTop: 10,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        backgroundColor: '#FFF3E0',
        borderRadius: 8,
        padding: 10,
    },
    timerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF5722',
        marginLeft: 8,
    },
    confirmationModal: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        alignSelf: 'center',
        maxWidth: 400,
    },
    confirmationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    confirmationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF5722',
        marginLeft: 10,
    },
    confirmationBody: {
        marginBottom: 20,
    },
    confirmationText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
    },
    confirmationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
    confirmButton: {
        flex: 1,
        padding: 12,
        borderRadius: 6,
        backgroundColor: '#FF5722',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    // Add these new styles for scenic route
    scenicRouteInfo: {
        backgroundColor: '#F3E5F5',
        borderRadius: 8,
        marginTop: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#9C27B0',
        marginBottom: 10,
    },
    scenicRouteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    scenicRouteContent: {
        padding: 12,
        paddingTop: 0,
    },
    scenicRouteTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#9C27B0',
        flex: 1,
    },
    scenicRouteDescription: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        lineHeight: 20,
    },
    scenicRouteStats: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    waypointText: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
        lineHeight: 18,
    },
});