import { Vehicle } from '~/interface/vehicle';
import apiClient from './apiClient';

export const vehiclesService = {
  // Lấy danh sách vehicles
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const response = await apiClient.get(`/vehicles`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
