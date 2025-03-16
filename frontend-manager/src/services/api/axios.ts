import axios from "axios";


const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API
console.log('API Base URL:', API_BASE_URL);
// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

// Add Authorization token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
            if (token) config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle API errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {

        return Promise.reject(error);
    }
);

export default axiosInstance;
