import apiClient from "~/services/apiClient";
import { INotification } from "~/interface/notification";

export const getPersonalNotification = async () => {
    try {
        const response = await apiClient.get('/notification/personal-notification');
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching personal notification:', error);
        throw error;
    }
}

export const markAllNotificationsAsRead = async () => {
    try {
        const response = await apiClient.patch('/notification/mark-all-read');
        return response.data;
    } catch (error: unknown) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}

// Thêm API lấy chi tiết thông báo
export const getNotificationDetail = async (notificationId: string): Promise<INotification> => {
    try {
        const response = await apiClient.get(`/notification/get/${notificationId}`);
        return response.data;
    } catch (error: unknown) {
        console.error(`Error fetching notification detail for ${notificationId}:`, error);
        throw error;
    }
}

// Thêm API đánh dấu một thông báo đã đọc
export const markNotificationAsRead = async (notificationId: string) => {
    try {
        const response = await apiClient.patch(`/notification/mark-read/${notificationId}`);
        return response.data;
    } catch (error: unknown) {
        console.error(`Error marking notification ${notificationId} as read:`, error);
        throw error;
    }
}