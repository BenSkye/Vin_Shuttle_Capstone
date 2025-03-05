import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import useTrackingSocket from '~/hook/useTrackingSocket';
import { useSchedule } from '~/context/ScheduleContext';
import { LocationData } from '~/interface/trip';
import { MIN_DISTANCE_CHANGE } from '~/constants/tracking.enum';

interface LocationContextType {
    location: LocationData | null;
    errorMsg: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { emitLocationUpdate, connect, disconnect, isConnected } = useTrackingSocket();
    const { isInProgress } = useSchedule();

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        const requestPermissionAndStartTracking = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Quyền truy cập vị trí bị từ chối!');
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: MIN_DISTANCE_CHANGE },
                (locationData) => {
                    const newLocation = {
                        latitude: locationData.coords.latitude,
                        longitude: locationData.coords.longitude,
                        heading: locationData.coords.heading,
                        speed: locationData.coords.speed
                    };
                    // Chỉ cập nhật và gửi nếu vị trí thực sự thay đổi
                    console.log('New location:', isConnected, newLocation);
                    setLocation(newLocation);
                    // console.log('New location:', isConnected, newLocation);
                    if (isInProgress && isConnected) {
                        emitLocationUpdate(newLocation);
                    }
                }
            );
        };


        if (isInProgress) {
            requestPermissionAndStartTracking();
        }

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [isInProgress, isConnected, emitLocationUpdate]);

    useEffect(() => {
        if (isInProgress) {
            connect();
        } else {
            disconnect();
        }
    }, [isInProgress, connect, disconnect]);

    return (
        <LocationContext.Provider value={{ location, errorMsg }}>
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