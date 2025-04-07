import apiClient from "./apiClient";
import { PriceManagement, UpdateServiceConfigRequest } from "./interface";

export const priceManagementServices = {
  /**
   * Lấy danh sách cấu hình giá
   */
  async getPrices(): Promise<PriceManagement[]> {
    try {
      const response = await apiClient.get("/pricing/vehicle-pricings");
      return response.data;
    } catch (error) {
      console.error("Error fetching price configurations:", error);
      throw error;
    }
  },

  /**
   * Cập nhật cấu hình dịch vụ
   * @param serviceType Loại dịch vụ (booking_hour/booking_trip/booking_share)
   * @param data Dữ liệu cập nhật
   */
  async updateServiceConfig(
    serviceType:
      | "booking_hour"
      | "booking_destination"
      | "booking_share"
      | "booking_scenic_route"
      | "booking_bus_route",
    data: UpdateServiceConfigRequest
  ): Promise<UpdateServiceConfigRequest> {
    try {
      const response = await apiClient.put(
        `/pricing/service-configs/${serviceType}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating ${serviceType} service config:`, error);
      throw error;
    }
  },

  /**
   * Lấy cấu hình dịch vụ theo loại
   * @param serviceType Loại dịch vụ (booking_hour/booking_trip/booking_share)
   */
  async getServiceConfig(
    serviceType:
      | "booking_hour"
      | "booking_trip"
      | "booking_share"
      | "booking_bus_route"
  ): Promise<UpdateServiceConfigRequest> {
    try {
      const response = await apiClient.get(
        `/pricing/service-configs/${serviceType}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${serviceType} service config:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật giá theo ID
   * @param priceId ID của cấu hình giá
   * @param data Dữ liệu cập nhật
   */
  async updatePrice(
    priceId: string,
    data: Partial<PriceManagement>
  ): Promise<PriceManagement> {
    try {
      const response = await apiClient.put(
        `/pricing/vehicle-pricings/${priceId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating price configuration with ID ${priceId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Lấy chi tiết cấu hình giá theo ID
   * @param priceId ID của cấu hình giá
   */
  async getPriceById(priceId: string): Promise<PriceManagement> {
    try {
      const response = await apiClient.get(
        `/pricing/vehicle-pricings/${priceId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching price configuration with ID ${priceId}:`,
        error
      );
      throw error;
    }
  },
};

// Re-export các interface để sử dụng nơi khác nếu cần
export type { PriceManagement, UpdateServiceConfigRequest };
