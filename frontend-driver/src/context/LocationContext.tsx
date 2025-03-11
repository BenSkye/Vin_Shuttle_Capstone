import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import useTrackingSocket from '~/hook/useTrackingSocket';
import { useSchedule } from '~/context/ScheduleContext';
import { LocationData } from '~/interface/trip';
import { MIN_DISTANCE_CHANGE, BACKGROUND_UPDATE_INTERVAL, FOREGROUND_UPDATE_INTERVAL } from '~/constants/tracking.enum';
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
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Quyền truy cập vị trí bị từ chối!');
                return false;
            }

            // Configure tracking options based on whether a trip is in progress
            const updateInterval = isInProgress 
                ? FOREGROUND_UPDATE_INTERVAL 
                : BACKGROUND_UPDATE_INTERVAL;

            // Stop existing subscription if any
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }

            // Start new subscription
            locationSubscription.current = await Location.watchPositionAsync(
                { 
                    accuracy: Location.Accuracy.High, 
                    timeInterval: updateInterval, 
                    distanceInterval: MIN_DISTANCE_CHANGE 
                },
                (locationData) => {
                    const newLocation = {
                        latitude: locationData.coords.latitude,
                        longitude: locationData.coords.longitude,
                        heading: locationData.coords.heading,
                        speed: locationData.coords.speed
                    };
                    
                    setLocation(newLocation);
                    setIsTracking(true);
                    
                    // Only emit location when a trip is in progress
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

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (
            appState.current.match(/inactive|background/) && 
            nextAppState === 'active'
        ) {
            // App has come to the foreground
            startLocationTracking();
        } else if (
            appState.current === 'active' &&
            nextAppState.match(/inactive|background/)
        ) {
            // App has gone to the background
            // Only stop tracking if no trip is in progress
            if (!isInProgress) {
                stopLocationTracking();
            }
        }
        
        appState.current = nextAppState;
    };

    // Initialize location tracking and app state listener
    useEffect(() => {
        // Start tracking when component mounts (app starts)
        startLocationTracking();
        
        // Set up AppState event listener
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            // Clean up on unmount
            stopLocationTracking();
            subscription.remove();
        };
    }, []);

    // Handle changes to trip status
    useEffect(() => {
        // When trip status changes, restart tracking with appropriate settings
        if (locationSubscription.current) {
            // Restart tracking with new interval settings
            startLocationTracking();
        }
        
        // Connect/disconnect socket based on trip status
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