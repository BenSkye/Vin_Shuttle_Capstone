import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    errorText: {
      color: 'red',
      textAlign: 'center',
      marginTop: 20,
      padding: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
    },
    loadingText: {
      textAlign: 'center',
      marginBottom: 20,
      fontSize: 16,
      color: '#333',
    },
    retryButton: {
      backgroundColor: '#1E88E5',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 4,
    },
    retryButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    errorBanner: {
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
      backgroundColor: 'rgba(255, 0, 0, 0.7)',
      padding: 10,
      borderRadius: 5,
    },
    errorBannerText: {
      color: 'white',
      textAlign: 'center',
    },
    routeIndicator: {
      position: 'absolute',
      top: 60,
      alignSelf: 'center',
      backgroundColor: 'rgba(156, 39, 176, 0.9)',
      padding: 8,
      borderRadius: 20,
    },
    routeIndicatorText: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
    locationStatusBar: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: 20,
      padding: 8,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    statusIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    locationStatusText: {
      fontSize: 12,
      color: '#333',
    },
    waypointMarker: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    waypointNumber: {
      position: 'absolute',
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: -5,
    },
    callout: {
      width: 200,
      padding: 8,
    },
    calloutTitle: {
      fontWeight: 'bold',
      fontSize: 14,
      marginBottom: 4,
    },
    calloutDescription: {
      fontSize: 12,
    },
  });