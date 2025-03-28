import apiClient from "./apiClient";

// Interface cho response data
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
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
      const reponse = await apiClient.get("/users");
      return reponse.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Add user
  async addUser(userData: Omit<User, "_id">): Promise<User> {
    try {
      const reponse = await apiClient.post("/auth/register", userData);
      return reponse.data;
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(): Promise<UserProfile> {
    try {
      const reponse = await apiClient.get("/users/profile");
      return reponse.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const reponse = await apiClient.put(
        "/users/profile",
        userData
      );
      return reponse.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Update password with new API structure
  // Update password with new API structure
  async updatePassword(
    passwordData: PasswordUpdate
  ): Promise<PasswordUpdateResponse> {
    try {
      const response = await apiClient.put(
        "/auth/change-password",
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }
      );

      // Lưu token mới vào localStorage
      if (response.data && response.data.token) {
        localStorage.setItem("accessToken", response.data.token.accessToken);
        localStorage.setItem("refreshToken", response.data.token.refreshToken);
      }

      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  // Lấy thông tin user theo ID
  async getUserById(userId: string): Promise<User> {
    try {
      const reponse = await apiClient.get(`/users/${userId}`);
      return reponse.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  },

  // Cập nhật thông tin user (admin chức năng)
  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const reponse = await apiClient.put(`/users/${userId}`, userData);
      return reponse.data;
    } catch (error) {
      console.error(`Error updating user with ID ${userId}:`, error);
      throw error;
    }
  },

  // Xóa user
  async deleteUser(userId: string): Promise<void> {
    try {
      const reponse = await apiClient.delete(`/users/${userId}`);
      return reponse.data;
    } catch (error) {
      console.error(`Error deleting user with ID ${userId}:`, error);
      throw error;
    }
  },
};

// Export các interface để sử dụng ở nơi khác
export type { User, UserProfile, PasswordUpdate, PasswordUpdateResponse };
