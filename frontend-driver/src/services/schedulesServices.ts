import apiClient from '~/services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Schedule } from '~/interface/schedule';

export const getPersonalSchedules = async (
  startDate: string,
  endDate: string
): Promise<Schedule[]> => {
  try {
    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      throw new Error('User ID not found');
    }

    console.log('Fetching schedules for user:', userId);

    const response = await apiClient.get(
      `/driver-schedules/get-personal-schedules-from-start-to-end/${startDate}/${endDate}`
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
      url: error.config?.url,
    });
    throw error;
  }
};

export const driverCheckin = async (driverScheduleId: string): Promise<Schedule> => {
  try {
    const response = await apiClient.get(`/driver-schedules/driver-checkin/${driverScheduleId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error checking in:', error);
    throw error;
  }
};

export const driverCheckout = async (driverScheduleId: string): Promise<Schedule> => {
  try {
    const response = await apiClient.get(`/driver-schedules/driver-checkout/${driverScheduleId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error checking out:', error);
    throw error;
  }
};

export const getPersonalScheduleToday = async (): Promise<Schedule[] | null> => {
  try {
    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      throw new Error('User ID not found');
    }

    const today = new Date().toISOString().split('T')[0];
    //today have type 2025-30-03
    console.log('today', today);

    const response = await apiClient.get(
      `/driver-schedules/get-personal-schedules-from-start-to-end/${today}/${today}`
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching today schedule:', error);
    throw error;
  }
};
