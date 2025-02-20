import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;

// Interface cho response data
interface Vehicle {
  _id: string;
  name: string;
  categoryId: string;
  licensePlate: string;
  isActive: boolean;
  status: string;
  image: string[];
  createdAt: string;
  updatedAt: string;
}

interface Vehicle2 {
  _id: string;
  name: string;
  categoryId: string;
  licensePlate: string;
  isActive: boolean;
  status: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

// Interface cho request data
interface AddVehicleRequest {
  name: string;
  categoryId: string;
  licensePlate: string;
  isActive: boolean;
  status: string;
  image: string[];
}

export const vehiclesService = {
  // Lấy danh sách vehicles
  async getVehicles(): Promise<Vehicle2[]> {
    try {
      const response = await axios.get(`${API_URL}/vehicles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Thêm vehicle mới
  async addVehicle(vehicleData: AddVehicleRequest): Promise<Vehicle> {
    try {
      const response = await axios.post(`${API_URL}/vehicles`, vehicleData, {
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

  // Lấy chi tiết vehicle theo ID
  async getVehicleById(vehicleId: string): Promise<Vehicle> {
    try {
      const response = await axios.get(`${API_URL}/vehicles/${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

