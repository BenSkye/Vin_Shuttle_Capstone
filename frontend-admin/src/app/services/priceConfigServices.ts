import axios from 'axios';
import { PriceManagement, UpdateServiceConfigRequest } from './interface';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;

export const priceManagementServices = {
  async getPrices(): Promise<PriceManagement[]> {
    try {
      const response = await axios.get(`${API_URL}/pricing/vehicle-pricings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateServiceConfig(
    serviceType: 'booking_hour' | 'booking_trip' | 'booking_share',
    data: UpdateServiceConfigRequest
  ): Promise<UpdateServiceConfigRequest> {
    try {
      const response = await axios.put(
        `${API_URL}/pricing/service-configs/${serviceType}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};