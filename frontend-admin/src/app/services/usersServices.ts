import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;

// Interface cho response data
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string
}

// Thêm interface cho profile
interface UserProfile {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

interface PasswordUpdate {
  oldPassword: string;
  newPassword: string;
}

interface PasswordUpdateResponse {
  isValid: boolean;
  token: {
    accessToken: string;
    refreshToken: string;
  };
  userId: string;
}

export const usersService = {
  // Lấy danh sách users
  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add user
  async addUser(userData: Omit<User, '_id'>): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await axios.put(`${API_URL}/users/profile`, userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update password with new API structure
  async updatePassword(passwordData: PasswordUpdate): Promise<PasswordUpdateResponse> {
    try {
      const response = await axios.put<PasswordUpdateResponse>(`${API_URL}/auth/change-password`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      // Lưu token mới vào localStorage
      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token.accessToken);
        localStorage.setItem('refreshToken', response.data.token.refreshToken);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
