import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteUserPushToken } from '~/services/userServices';
import apiClient from '~/services/apiClient';
import { LoginCredentials, LoginResponse } from '~/interface/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Sử dụng apiClient thay vì axios
      const response = await apiClient.post('/auth/login-by-password', credentials);
      console.log('accessToken:', response.data.token.accessToken);
      console.log('refreshToken:', response.data.token.refreshToken);
      console.log('userId:', response.data.userId);

      // Lưu tokens và userId vào AsyncStorage
      if (response.data.isValid) {
        await AsyncStorage.multiSet([
          ['accessToken', response.data.token.accessToken],
          ['refreshToken', response.data.token.refreshToken],
          ['userId', response.data.userId],
        ]);
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      // Xóa push token trước khi clear storage
      try {
        await deleteUserPushToken();
        console.log('Push token deleted successfully');
      } catch (e) {
        console.log('Error deleting push token, but continuing logout:', e);
        // Không throw error ở đây để tiếp tục quá trình đăng xuất
      }

      // Chỉ xóa các token xác thực, không xóa toàn bộ storage
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId']);
      console.log('Auth tokens removed from storage');
    } catch (error) {
      console.error('Error during logout in authService:', error);
      // Không throw error để đảm bảo quá trình logout vẫn tiếp tục
    }
  },

  async checkAuthState(): Promise<boolean> {
    try {
      // Kiểm tra đầy đủ cả accessToken và userId
      const accessToken = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');
      return !!(accessToken && userId);
    } catch (error) {
      console.error('Error checking auth state:', error);
      return false;
    }
  },

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userId = await AsyncStorage.getItem('userId');

      if (!refreshToken || !userId) {
        console.error('Missing refresh token or userId');
        return false;
      }

      // Gọi API refresh token
      const response = await apiClient.post(
        '/auth/refresh-token',
        {},
        {
          headers: {
            'x-refresh-token': `Bearer ${refreshToken}`,
            'x-client-id': userId,
          },
        }
      );

      if (response.data && response.data.token) {
        // Lưu token mới
        await AsyncStorage.multiSet([
          ['accessToken', response.data.token.accessToken],
          ['refreshToken', response.data.token.refreshToken],
        ]);
        console.log('Tokens refreshed successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  },
};
