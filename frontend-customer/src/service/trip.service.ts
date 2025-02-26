import apiClient from "@/service/apiClient";

export const getPersonalTripById = async (id: string) => {
    try {
        const response = await apiClient.get(`/trip/customer-personal-trip/${id}`);
        return response.data;
    } catch (error: unknown) {
        if (error.response) {
            const serverError = error.response.data;
            throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định');
        }
        throw new Error('Lỗi kết nối máy chủ');
    }
}

export const getPersonalTrip = async () => {
    try {
        const response = await apiClient.get(`/trip/customer-personal-trip`);
        return response.data;
    } catch (error: unknown) {
        if (error.response) {
            const serverError = error.response.data;
            throw new Error(serverError.vnMessage || serverError.message || 'Lỗi không xác định');
        }
        throw new Error('Lỗi kết nối máy chủ');
    }
}