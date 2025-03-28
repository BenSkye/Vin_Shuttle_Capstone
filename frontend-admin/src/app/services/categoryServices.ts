import apiClient from './apiClient';

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
      // Sửa từ post thành get vì đây là lấy danh sách
      const response = await apiClient.get('/vehicle-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Thêm category mới
  async addCategory(categoryData: Omit<VehicleCategory, '_id'>): Promise<VehicleCategory> {
    try {
      // Sử dụng apiClient thay vì axios trực tiếp
      const response = await apiClient.post('/vehicle-categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  // Lấy chi tiết category theo ID
  async getCategoryById(id: string): Promise<VehicleCategory> {
    try {
      // Sử dụng apiClient thay vì axios trực tiếp
      const response = await apiClient.get(`/vehicle-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw error;
    }
  },

  // Cập nhật category
  async updateCategory(id: string, categoryData: Omit<VehicleCategory, '_id'>): Promise<VehicleCategory> {
    try {
      // Sử dụng apiClient thay vì axios trực tiếp
      const response = await apiClient.put(`/vehicle-categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error);
      throw error;
    }
  },

  // Thêm hàm xóa category
  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`/vehicle-categories/${id}`);
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error);
      throw error;
    }
  }
};

// Export interface để sử dụng ở nơi khác
export type { VehicleCategory };