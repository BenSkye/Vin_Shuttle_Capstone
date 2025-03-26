import apiClient from './apiClient';
import { Trip } from './interface';

/**
 * Lấy danh sách tất cả các chuyến đi
 * @returns Danh sách các chuyến đi
 */
export const getTripList = async (): Promise<Trip[]> => {
  try {
    const response = await apiClient.get('/trip/list-query');
    return response.data;
  } catch (error) {
    console.error('Error fetching trip list:', error);
    throw error;
  }
};

/**
 * Lấy tổng số tiền từ tất cả các chuyến đi
 * @returns Tổng số tiền
 */
export const getTotalAmount = async (): Promise<number> => {
  try {
    const response = await apiClient.get('/trip/total-amount');
    return response.data;
  } catch (error) {
    console.error('Error fetching total amount:', error);
    throw error;
  }
};