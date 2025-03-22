import { AvailableVehicle } from '@/interface/booking';
import { Position } from '@/interface/trip';
import apiClient from '@/service/apiClient';
import { AxiosError } from 'axios';

export const vehicleSearchHour = async (date: string, startTime: string, durationMinutes: number): Promise<AvailableVehicle> => {
    try {
        const response = await apiClient.get(`/search/available-vehicle-search-hour/${date}/${startTime}/${durationMinutes}`);
        console.log('✅ API Response:', response.data);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response?.data) {
            const serverError = error.response.data;
            console.error('⚠ Server Error:', serverError);

            throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định');
        }
        throw new Error('Lỗi kết nối máy chủ');
    }
}

export const vehicleSearchDestination = async (
    estimatedDuration: number,
    estimatedDistance: number,
    endPoint: Position,
    startPoint: Position
): Promise<AvailableVehicle> => {
    try {
        const response = await apiClient.get(
            `/search/available-vehicle-search-scenic-route/${startPoint}/${endPoint}/${estimatedDuration}/${estimatedDistance}`
        );
        console.log('responseDestination', response.data);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response?.data) {
            const serverError = error.response.data;
            throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định');
        }
        throw new Error('Lỗi kết nối máy chủ');
    }
};

export const vehicleSearchRoute = async (date: string, startTime: string, scenicRouteId: string): Promise<AvailableVehicle[]> => {
    try {
        const response = await apiClient.get(`/search/available-vehicle-search-scenic-route/${date}/${startTime}/${scenicRouteId}`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error("Error in vehicleSearchRoute:", error);
        return [];
    }
};

