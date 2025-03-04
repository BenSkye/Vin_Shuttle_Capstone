import axios from 'axios';
import apiClient from './apiClient';

export const loginCustomer = async (phoneData: { phone: string }) => {
    try {
        const response = await apiClient.post('auth/login-customer', {
            phone: phoneData.phone
        });
        console.log('OTP receiveddddd:', response);
        return response;
    } catch (error) {
        throw error;
    }
}

export const verifyOTP = async (data: { phone: string, code: string }) => {
    try {
        const response = await apiClient.post('otp/verify', {
            phone: data.phone,
            code: data.code
        });
        console.log('OTP:', response.data.userId);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const profileUser = async () => {
    try {
        const response = await apiClient.get('users/profile');
        console.log('Profile:', response.data);
        return response;
    } catch (error) {
        throw error;
    }
}

export const editProfile = async (data: { name: string, email: string, phone: string }) => {
    try {
        const response = await apiClient.put('users/profile', data);
        console.log('Profile:', response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
