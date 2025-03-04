import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from "~/interface/trip";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Customer {
  _id: string;
  name: string;
}

interface Driver {
  _id: string;
  name: string;
}

interface Vehicle {
  _id: string;
  name: string;
  licensePlate: string;
  operationStatus: string;
  vehicleCondition: string;
}

interface ServicePayload {
  bookingHour: {
    totalTime: number;
    startPoint: {
      lat: number;
      lng: number;
    };
  };
}

interface StatusHistory {
  status: string;
  changedAt: string;
  _id: string;
}



export const getPersonalTrips = async (): Promise<Trip[]> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(
      `${API_URL}/trip/driver-personal-trip`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching personal trips:', error);
    throw error;
  }
};
