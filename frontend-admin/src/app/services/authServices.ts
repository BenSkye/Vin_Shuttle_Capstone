import apiClient from "./apiClient";
import { jwtDecode } from "jwt-decode";

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

interface JwtPayload {
  sub: string;
  role: string; // Trường chứa quyền người dùng trong token
  email: string;
  exp: number;
  iat: number;
  // Các trường khác trong payload nếu có
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post(
        `/auth/login-by-password`,
        credentials
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  decodeAccessToken(token: string): JwtPayload {
    return jwtDecode<JwtPayload>(token);
  },

  isAdmin(token: string): boolean {
    try {
      const decoded = this.decodeAccessToken(token);
      return decoded.role === "admin"; // Hoặc bạn có thể kiểm tra các giá trị khác tùy thuộc vào cấu trúc token
    } catch (error) {
      console.error("Error decoding token:", error);
      return false;
    }
  },

  async forgotPassword(email: string) {
    try {
      const response = await apiClient.post(
        `/auth/forgot-password`,
        { email }
      );
      return response.data;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },

  async resetForgotPassword(token: string, newPassword: string) {
    try {
      const response = await apiClient.post(
        `/auth/reset-forgot-password`,
        {
          token,
          newPassword,
        }
      );
      console.log("response", response);
      return response.data;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }
};
