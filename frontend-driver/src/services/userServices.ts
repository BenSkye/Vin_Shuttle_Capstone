import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '~/services/apiClient';
import { User } from '~/interface/user';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Define interface for user profile

// Get user profile function
const getUserProfile = async (): Promise<User> => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  const userId = await AsyncStorage.getItem('userId');

  if (!accessToken) {
    throw new Error('ACCESS_TOKEN_NOT_FOUND');
  }

  if (!userId) {
    throw new Error('USER_ID_NOT_FOUND');
  }

  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-client-id': userId,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message === 'TokenExpiredError: jwt expired') {
      throw new Error('TOKEN_EXPIRED');
    }
    throw error;
  }
};

const updateUserPushToken = async (pushToken: string): Promise<void> => {
  try {
    const response = await apiClient.put('/users/save-push-token', {
      pushToken,
    });
  } catch (error: unknown) {
    console.error('Error fetching personal notification:', error);
    throw error;
  }
};

const deleteUserPushToken = async (): Promise<void> => {
  try {
    // Kiểm tra xem token và userId có tồn tại không trước khi gọi API
    const accessToken = await AsyncStorage.getItem('accessToken');
    const userId = await AsyncStorage.getItem('userId');

    if (!accessToken || !userId) {
      console.log('No token or userId found when trying to delete push token');
      return; // Không cần throw error, chỉ return
    }

    // Gọi API trực tiếp với axios thay vì apiClient để kiểm soát headers
    await axios.delete(`${API_URL}/users/delete-push-token`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-client-id': userId,
      },
    });

    console.log('Push token deleted successfully');
  } catch (error: any) {
    // Log chi tiết lỗi để debug
    console.error('Error deleting push token:', error.message);
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', error.response.data);
    }

    // Không throw error để đảm bảo quá trình logout vẫn tiếp tục
  }
};

export { getUserProfile, updateUserPushToken, deleteUserPushToken };
export type { User };
