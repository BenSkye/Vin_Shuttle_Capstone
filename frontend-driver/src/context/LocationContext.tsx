import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';
import useTrackingSocket from '~/hook/useTrackingSocket';
import { useSchedule } from '~/context/ScheduleContext';
import { LocationData } from '~/interface/trip';
import {
  MIN_DISTANCE_CHANGE,
  BACKGROUND_UPDATE_INTERVAL,
  FOREGROUND_UPDATE_INTERVAL,
} from '~/constants/tracking.enum';
import { AppState, AppStateStatus } from 'react-native';

interface LocationContextType {
  location: LocationData | null;
  errorMsg: string | null;
  isTracking: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const { emitLocationUpdate, connect, disconnect, isConnected } = useTrackingSocket();
  const { isInProgress, updateIsInProgress } = useSchedule();
  const appState = useRef(AppState.currentState);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Function to start location tracking
  const startLocationTracking = async () => {
    try {
      // Kiểm tra trạng thái quyền trước
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const permissionResponse = await Location.requestForegroundPermissionsAsync();
        status = permissionResponse.status;
        if (status !== 'granted') {
          setErrorMsg('Quyền truy cập vị trí bị từ chối!');
          Alert.alert(
            'Cần quyền vị trí',
            'Ứng dụng cần truy cập vị trí để hoạt động. Vui lòng cấp quyền trong cài đặt.',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
            ]
          );
          return false;
        }
      }

      // Configure tracking options based on whether a trip is in progress
      const updateInterval = isInProgress ? FOREGROUND_UPDATE_INTERVAL : BACKGROUND_UPDATE_INTERVAL;

      // Stop existing subscription if any
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }

      // Start new subscription
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Cập nhật mỗi 5 giây
          distanceInterval: 10, // Cập nhật khi di chuyển 10m
        },
        (locationData) => {
          if (!locationData?.coords) {
            setErrorMsg('Dữ liệu vị trí không hợp lệ');
            return;
          }
          const newLocation = {
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
            heading: locationData.coords.heading ?? 0, // Mặc định 0 nếu null
            speed: locationData.coords.speed ?? 0, // Mặc định 0 nếu null
          };
          console.log('Location update:', newLocation);
          setLocation(newLocation);
          setIsTracking(true);

          // Only emit location when a trip is in progress
          console.log('isInProgress:', isInProgress);
          console.log('isConnected:', isConnected);
          if (isInProgress && isConnected) {
            emitLocationUpdate(newLocation);
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setErrorMsg('Không thể theo dõi vị trí: ' + error);
      return false;
    }
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
      setIsTracking(false);
    }
  };

  // Initialize location tracking and app state listener
  useEffect(() => {
    let isMounted = true;

    const initTracking = async () => {
      if (isMounted) {
        await startLocationTracking();
      }
    };
    initTracking();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        startLocationTracking();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        if (!isInProgress) {
          stopLocationTracking();
        }
      }
      appState.current = nextAppState;
    });

    // Quản lý socket dựa trên isInProgress
    if (isInProgress && !isConnected) {
      connect();
    } else if (!isInProgress && isConnected) {
      disconnect();
    }

    // Cleanup
    return () => {
      isMounted = false;
      stopLocationTracking();
      subscription.remove();
      if (isConnected) disconnect();
    };
  }, [isInProgress, isConnected]);

  // Debug log để kiểm tra khi deploy
  useEffect(() => {
    // When trip status changes, restart tracking with appropriate settings
    if (locationSubscription.current) {
      // Restart tracking with new interval settings
      startLocationTracking();
    }

    // Connect/disconnect socket based on schedule status
    if (isInProgress) {
      connect();
    } else {
      disconnect();
    }
  }, [isInProgress, connect, disconnect]);

  return (
    <LocationContext.Provider value={{ location, errorMsg, isTracking }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};