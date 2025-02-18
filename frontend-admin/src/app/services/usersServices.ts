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
      const response = await axios.post(`${API_URL}/users/profile`, userData, {
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

  // Update password
  async updatePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await axios.put(`${API_URL}/users/password`, passwordData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      throw error;
    }
  }
};
