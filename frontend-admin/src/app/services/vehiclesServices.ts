import apiClient from "./apiClient";

// Interface cho response data
interface Vehicle {
  _id: string;
  name: string;
  categoryId: string;
  licensePlate: string;
  vehicleCondition: "available" | "in-use" | "maintenance";
  operationStatus: "pending" | "running" | "charging";
  image: string[];
  createdAt: string;
  updatedAt: string;
}

// Interface cho request data
interface AddVehicleRequest {
  name: string;
  categoryId: string;
  licensePlate: string;
  vehicleCondition: "available" | "in-use" | "maintenance";
  operationStatus: "pending" | "running" | "charging";
  image: string[];
}

export const vehiclesService = {
  /**
   * Lấy danh sách vehicles
   * @returns Danh sách phương tiện
   */
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get("/vehicles");
      return response.data;
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      throw error;
    }
  },

  /**
   * Thêm vehicle mới
   * @param vehicleData Dữ liệu phương tiện cần thêm
   * @returns Thông tin phương tiện đã thêm
   */
  async addVehicle(vehicleData: AddVehicleRequest): Promise<Vehicle> {
    try {
      const response = await apiClient.post("/vehicles", vehicleData);
      return response.data;
    } catch (error) {
      console.error("Error adding vehicle:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết vehicle theo ID
   * @param vehicleId ID của phương tiện
   * @returns Thông tin chi tiết của phương tiện
   */
  async getVehicleById(vehicleId: string): Promise<Vehicle> {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vehicle with ID ${vehicleId}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin vehicle
   * @param vehicleId ID của phương tiện cần cập nhật
   * @param vehicleData Dữ liệu cập nhật
   * @returns Thông tin phương tiện đã được cập nhật
   */
  async updateVehicle(
    vehicleId: string,
    vehicleData: AddVehicleRequest
  ): Promise<Vehicle> {
    try {
      // Đảm bảo image luôn là một mảng
      const formattedData = {
        ...vehicleData,
        image: Array.isArray(vehicleData.image)
          ? vehicleData.image
          : [vehicleData.image],
      };

      const response = await apiClient.put(
        `/vehicles/${vehicleId}`,
        formattedData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating vehicle with ID ${vehicleId}:`, error);
      throw error;
    }
  },
};
