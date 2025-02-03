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
};
