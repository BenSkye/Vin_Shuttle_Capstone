//import { getSenicRoute } from './../../../frontend-customer/src/service/scenics';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from "~/interface/trip";
import { ScenicRouteDto } from "~/interface/trip";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string
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

export const pickUp = async (tripId: string): Promise<Trip> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_URL}/trip/driver-pickup-customer`,
      { tripId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating to pickup status:', error);
    throw error;
  }
};

export const startTrip = async (tripId: string): Promise<Trip> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_URL}/trip/driver-start-trip`,
      { tripId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error starting trip:', error);
    throw error;
  }
};

export const completeTrip = async (tripId: string): Promise<Trip> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_URL}/trip/driver-complete-trip`,
      { tripId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error completing trip:', error);
    throw error;
  }
};

export const getSenicRouteById = async (routeId: string): Promise<ScenicRouteDto> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(
      `${API_URL}/scenic-routes/${routeId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching scenic route:', error);
    throw error;
  }
};

export { Trip };