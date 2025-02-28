import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Vehicle {
    _id: string;
    name: string;
    categoryId: string;
    licensePlate: string;
    vehicleCondition: 'available' | 'in-use' | 'maintenance';
    operationStatus: 'pending' | 'running' | 'charging';
    image: string[];
    createdAt: string;
    updatedAt: string;
}

export const vehiclesService = {
    // Lấy danh sách vehicles
    async getVehicles(): Promise<Vehicle[]> {
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
}