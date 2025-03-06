import axiosInstance from './axios';
import { API_ENDPOINT } from '@/constants/api';

interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: File | string;
}

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINT.USERS.PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (data: ProfileUpdateData) => {
  try {
    const response = await axiosInstance.patch(API_ENDPOINT.USERS.PROFILE, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadProfileImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(API_ENDPOINT.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};