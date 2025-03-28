import apiClient from './apiClient';
import { PricingConfig, UpdatePricingRequest, PriceManagement } from './interface';

interface PriceCalculationRequest {
  base_unit: number;
  tiered_pricing: {
    range: number;
    price: number;
  }[];
  total_units: number;
}

interface PriceCalculationResponse {
  totalPrice: number;
  calculations: string[];
}

export const pricingConfigServices = {
  /**
   * Lấy danh sách các pricing configs
   */
  async getServiceConfigs(): Promise<PricingConfig[]> {
    try {
      const response = await apiClient.get('/pricing/service-configs');
      return response.data;
    } catch (error) {
      console.error('Error fetching service configs:', error);
      throw error;
    }
  },

  /**
   * Cập nhật pricing cho phương tiện
   * @param data Dữ liệu cập nhật
   */
  async updatePricing(data: UpdatePricingRequest): Promise<UpdatePricingRequest> {
    try {
      const response = await apiClient.put('/pricing/vehicle-pricings', data);
      return response.data;
    } catch (error) {
      console.error('Error updating pricing:', error);
      throw error;
    }
  },

  /**
   * Thêm pricing mới cho phương tiện
   * @param data Dữ liệu pricing mới
   */
  async addPricing(data: UpdatePricingRequest): Promise<PriceManagement> {
    try {
      const response = await apiClient.post('/pricing/vehicle-pricings', data);
      return response.data;
    } catch (error) {
      console.error('Error adding pricing:', error);
      throw error;
    }
  },

  /**
   * Tính toán giá dựa trên thông số đưa vào
   * @param data Dữ liệu đầu vào để tính toán giá
   */
  async calculatePrice(data: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    try {
      const response = await apiClient.post('/pricing/vehicle-pricings-test-price', data);
      return response.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      throw error;
    }
  },

  /**
   * Lấy pricing theo ID
   * @param id ID của pricing cần lấy
   */
  async getPricingById(id: string): Promise<PriceManagement> {
    try {
      const response = await apiClient.get(`/pricing/vehicle-pricings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pricing with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa pricing
   * @param id ID của pricing cần xóa
   */
  async deletePricing(id: string): Promise<void> {
    try {
      await apiClient.delete(`/pricing/vehicle-pricings/${id}`);
    } catch (error) {
      console.error(`Error deleting pricing with ID ${id}:`, error);
      throw error;
    }
  }
};

// Export interfaces để sử dụng ở nơi khác
export type { PriceCalculationRequest, PriceCalculationResponse };