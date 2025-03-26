import axios from 'axios';
import Cookies from 'js-cookie';
import { executeLogout, executeSetIsLoginFalse, executeSetIsLoginTrue } from '@/services/api/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
console.log('API Base URL:', API_BASE_URL);

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },
});

// Add Authorization token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        config.headers['x-client-id'] = Cookies.get('userId') || '';
        config.headers['authorization'] = 'Bearer ' + (Cookies.get('authorization') || '');

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Handle API errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.error('Response error:', error);

        if ((error.response.status === 450) && !originalRequest._retry) {
            console.log('Handling error 450');

            originalRequest._retry = true;
            const refreshToken = Cookies.get('refreshToken');

            if (!refreshToken) {
                return Promise.reject(error);
            }

            try {
                executeSetIsLoginFalse();
                const response = await axiosInstance.post('/auth/refresh-token', {}, {
                    headers: {
                        'x-client-id': Cookies.get('userId') || '',
                        'x-refresh-token': refreshToken
                    }
                });

                console.log('Refresh token response:', response);
                Cookies.set('authorization', response.data.accessToken, { expires: 2 });
                Cookies.set('refreshToken', response.data.refreshToken, { expires: 7 });
                executeSetIsLoginTrue();
                originalRequest.headers['authorization'] = 'Bearer ' + response.data.accessToken;
                return axiosInstance(originalRequest);

            } catch (error) {
                return Promise.reject(error);
            }
        }

        if (error.response.status === 401 || error.response.status === 403) {
            executeLogout();
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
