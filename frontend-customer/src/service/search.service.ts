import { AvailableVehicle } from '@/interface/booking';
import apiClient from '@/service/apiClient';

interface Coordinates {
    lat: number;
    lng: number;
}

export const vehicleSearchHour = async (date: string, startTime: string, durationMinutes: number): Promise<AvailableVehicle> => {
    try {
        const response = await apiClient.get(`/search/available-vehicle-search-hour/${date}/${startTime}/${durationMinutes}`);
        return response.data;
    } catch (error: unknown) {
        if (error.response) {
            const serverError = error.response.data;
            throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định');
        }
        throw new Error('Lỗi kết nối máy chủ');
    }
}

export const vehicleSearchDestination = async (
    estimatedDuration: number,
    estimatedDistance: number,
    endPoint: Object,
    startPoint: Object
): Promise<AvailableVehicle> => {
    try {
        const response = await apiClient.get(
            `/search/available-vehicle-search-scenic-route/${startPoint}/${endPoint}/${estimatedDuration}/${estimatedDistance}`
        );
        console.log('responseDestination', response.data);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            const serverError = error.response.data;
            throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định');
        }
        throw new Error('Lỗi kết nối máy chủ');


    }
};


export const vehicleSearchRoute = async (date: string, startTime: string, scenicRouteId: string) => {

    try {
        const response = await apiClient.get(`/search/available-vehicle-search-scenic-route/${date}/${startTime}/${scenicRouteId}`);
        return response.data;
    } catch (e) {
        console.log("Error", e)
        return { vehicles: [] };
    }


}

