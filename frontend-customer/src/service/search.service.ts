import { AvailableVehicle } from '@/interface/booking';
import apiClient from '@/service/apiClient';

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
