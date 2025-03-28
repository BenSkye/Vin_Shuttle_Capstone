import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await localStorage.getItem('accessToken');
      const userId = await localStorage.getItem('userId');
      // config.headers['x-client-id'] = 'Bearer ' + Cookies.get('x-client-id') || '';
      if (accessToken && userId) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
        config.headers['x-client-id'] = userId;
      }
      return config;
    } catch (error) {
      console.error('Error getting accessToken from AsyncStorage:', error);
      return config; // Trả về config gốc nếu có lỗi
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;