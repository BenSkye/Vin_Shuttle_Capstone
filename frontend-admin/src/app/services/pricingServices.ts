import axios from 'axios';
import { PricingConfig, UpdatePricingRequest, PriceManagement } from './interface';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;

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
    // Lấy danh sách các pricing
    async getServiceConfigs(): Promise<PricingConfig[]> {
        try {
            const response = await axios.get(`${API_URL}/pricing/service-configs`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async updatePricing(data: UpdatePricingRequest): Promise<UpdatePricingRequest> {
        try {
            const response = await axios.put(`${API_URL}/pricing/vehicle-pricings`, data, {
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

    async addPricing(data: UpdatePricingRequest): Promise<PriceManagement> {
        try {
            const response = await axios.post(`${API_URL}/pricing/vehicle-pricings`, data, {
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

    async calculatePrice(data: PriceCalculationRequest): Promise<PriceCalculationResponse> {
        try {
            const response = await axios.post(`${API_URL}/pricing/vehicle-pricings-test-price`, data, {
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