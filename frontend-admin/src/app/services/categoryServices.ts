import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;

// Interface cho category
interface VehicleCategory {
  _id: string;
  name: string;
  description: string;
  numberOfSeat: number;
}

export const categoryService = {
  // Lấy danh sách categories
  async getCategories(): Promise<VehicleCategory[]> {
    try {
      const response = await axios.get(`${API_URL}/vehicle-categories`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Thêm category mới
  async addCategory(categoryData: Omit<VehicleCategory, '_id'>): Promise<VehicleCategory> {
    try {
      const response = await axios.post(`${API_URL}/vehicle-categories`, categoryData, {
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

  // Lấy chi tiết category theo ID
  async getCategoryById(id: string): Promise<VehicleCategory> {
    try {
      const response = await axios.get(`${API_URL}/vehicle-categories/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật category
  async updateCategory(id: string, categoryData: Omit<VehicleCategory, '_id'>): Promise<VehicleCategory> {
    try {
      const response = await axios.put(`${API_URL}/vehicle-categories/${id}`, categoryData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};