import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  isValid: boolean;
  token: {
    accessToken: string;
    refreshToken: string;
  };
  userId: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login-by-password`, credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};