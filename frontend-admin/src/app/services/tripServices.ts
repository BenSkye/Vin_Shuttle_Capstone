import axios from 'axios';
import { Trip } from './interface';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;


export const getTripList = async (): Promise<Trip[]> => {
  try {
    const response = await axios.get(`${API_URL}/trip/list-query`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trip list:', error);
    throw error;
  }
};