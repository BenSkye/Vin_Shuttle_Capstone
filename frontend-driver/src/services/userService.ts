import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Define interface for user profile
interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatar: string;
}

// Get user profile function
const getUserProfile = async (): Promise<UserProfile> => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('TOKEN_NOT_FOUND');
  }

  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message === 'TokenExpiredError: jwt expired') {
      throw new Error('TOKEN_EXPIRED');
    }
    throw error;
  }
};

export { getUserProfile };
export type { UserProfile };

