import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  // Thêm các trường khác nếu API trả về
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