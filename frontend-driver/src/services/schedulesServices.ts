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
  checkinTime: string;
  checkoutTime: string;
}

export const getPersonalSchedules = async (startDate: string, endDate: string): Promise<Schedule[]> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      throw new Error('User ID not found');
    }

    console.log('Fetching schedules for user:', userId);

    const response = await axios.get(
      `${API_URL}/driver-schedules/get-personal-schedules-from-start-to-end/${startDate}/${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Lọc chỉ lấy lịch của driver đang đăng nhập
    const personalSchedules = response.data.filter(
      (schedule: Schedule) => schedule.driver._id === userId
    );

    console.log('Filtered personal schedules:', personalSchedules);
    return personalSchedules;
  } catch (error: any) {
    console.error('Error fetching schedules:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    throw error;
  }
};

export const driverCheckin = async (driverScheduleId: string): Promise<Schedule> => {
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
  } catch (error: any) {
    console.error('Error checking in:', error);
    throw error;
  }
};

export const driverCheckout = async (driverScheduleId: string): Promise<Schedule> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
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
    console.error('Error checking out:', error);
    throw error;
  }
};




