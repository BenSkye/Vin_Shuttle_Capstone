import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteUserPushToken } from "~/services/userServices";

const API_URL = process.env.EXPO_PUBLIC_API_URL;


interface LoginResponse {
  isValid: boolean;
  token: {
    accessToken: string;
    refreshToken: string;
  };
  userId: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('API_URL:', API_URL);
      const response = await axios.post(`${API_URL}/auth/login-by-password`, credentials);
      console.log('acessstokennnn:', response.data.token.accessToken);
      // Store tokens and userId in AsyncStorage
      if (response.data.isValid) {
        await AsyncStorage.multiSet([
          ['accessToken', response.data.token.accessToken],
          ['refreshToken', response.data.token.refreshToken],
          ['userId', response.data.userId]
        ]);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await deleteUserPushToken();
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId']);
    } catch (error) {
      throw error;
    }
  },

  async checkAuthState(): Promise<boolean> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      return !!accessToken; // Returns true if accessToken exists, false otherwise
    } catch (error) {
      return false;
    }
  },
};
