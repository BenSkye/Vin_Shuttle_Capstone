import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Schedule {
  _id: string;
  driver: {
    _id: string;
    name: string;
  };
  date: string;
  shift: string;
  vehicle: {
    _id: string;
    name: string;
  };
  status: string;
  isLate: boolean;
  isEarlyCheckout: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getPersonalSchedules = async (startDate: string, endDate: string): Promise<Schedule[]> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(
      `${API_URL}/driver-schedules/get-personal-schedules-from-start-to-end/${startDate}/${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

export const driverCheckin = async (driverScheduleId: string): Promise<any> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(
      `${API_URL}/driver-schedules/driver-checkin/${driverScheduleId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error checking in:', error);
    throw error;
  }
};

export const driverCheckout = async (driverScheduleId: string): Promise<any> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    console.log('Checkout Request Details:', {
      scheduleId: driverScheduleId,
      url: `${API_URL}/driver-schedules/driver-checkout/${driverScheduleId}`,
      token: accessToken
    });
    
    // Log the full schedule object before checkout
    const schedule = await axios.get(
      `${API_URL}/driver-schedules/${driverScheduleId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('Schedule before checkout:', schedule.data);

    const response = await axios.get(
      `${API_URL}/driver-schedules/driver-checkout/${driverScheduleId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error in driverCheckout:', {
      scheduleId: driverScheduleId,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.config?.headers
    });
    throw error;
  }
};



