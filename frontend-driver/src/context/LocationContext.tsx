import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import useTrackingSocket from '~/hook/useTrackingSocket';
import { useSchedule } from '~/context/ScheduleContext';

interface LocationContextType {
    location: { latitude: number; longitude: number } | null;
    errorMsg: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { emitLocationUpdate, connect, disconnect, isConnected } = useTrackingSocket();
    const { isInProgress } = useSchedule();

    useEffect(() => {
        if (isInProgress && !isConnected) {
            connect();
        } else if (!isInProgress && isConnected) {
            disconnect();
        }
    }, [isInProgress, isConnected, connect, disconnect]);

    // Theo dõi và cập nhật vị trí liên tục
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        const requestPermissionAndStartTracking = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Quyền truy cập vị trí bị từ chối!');
                return;
            }

            await updateLocation();

            // Cập nhật vị trí mỗi 5 giây
            intervalId = setInterval(updateLocation, 5000);
        };

        const updateLocation = async () => {
            try {
                const locationData = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                const newLocation = {
                    latitude: locationData.coords.latitude,
                    longitude: locationData.coords.longitude,
                };
                setLocation(newLocation);
                // Chỉ gửi vị trí về server nếu đang trong ca làm và socket đã kết nối
                if (isInProgress && isConnected) {
                    emitLocationUpdate(newLocation);
                }
            } catch (error) {
                console.error('Lỗi khi lấy vị trí:', error);
            }
        };

        // Bắt đầu theo dõi vị trí ngay khi LocationProvider mount
        requestPermissionAndStartTracking();

        // Cleanup interval khi component unmount (dù điều này không xảy ra vì Context bao toàn app)
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isInProgress, isConnected, emitLocationUpdate]);

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