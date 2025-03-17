import apiClient from "~/services/apiClient";


export const getPersonalNotification = async () => {
    try {
        const response = await apiClient.get('/notification/personal-notification');
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching personal notification:', error);
        throw error;
    }
}

