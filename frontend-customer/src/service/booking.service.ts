import apiClient from "@/service/apiClient";
import { BookingHourRequest } from "@/interface/booking";
import { BookingResponse } from "@/interface/booking";

export const bookingHour = async (payload: BookingHourRequest): Promise<BookingResponse> => {
    try {
        const response = await apiClient.post('/booking/create-booking-hour', payload);
        console.log('response', response.data);
        return response.data;

    } catch (error: unknown) {
        if (error.response) {
            const serverError = error.response.data;
            console.error('severError', serverError.statusCode);
            throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định');
        }
        throw new Error('Lỗi kết nối máy chủ');
    }
}