import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vinshuttle.com';

// Create a custom hook for using authenticated API requests
export function useApi() {
    const { getAuthToken, logout } = useAuth();

    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add auth token to every request if available
    api.interceptors.request.use(config => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Handle unauthorized responses
    api.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 401) {
                // Token expired or invalid
                logout();
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return api;
}

// For non-component use
export const createApiWithToken = (token: string) => {
    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    return api;
};