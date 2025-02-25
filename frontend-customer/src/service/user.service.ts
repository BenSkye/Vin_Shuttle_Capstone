import axios from 'axios';

export const loginCustomer = async (phoneData: { phone: string }) => {
    try {
        const response = await axios.post('http://localhost:2028/auth/login-customer', {
            phone: phoneData.phone
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export const verifyOTP = async (data: { phone: string, code: string }) => {
    try {
        const response = await axios.post('http://localhost:2028/otp/verify', {
            phone: data.phone,
            code: data.code
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}