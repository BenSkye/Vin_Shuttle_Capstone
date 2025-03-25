import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');
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

// apiClient.interceptors.response.use(function (response) {
//   return response;
// }, async function (error) {
//   const originalRequest = error.config;
//   console.log('error::', error)
//   if ((error.response.status === 401 || error.response.status === 403 || error.response.data.message === "jwt expired") && !originalRequest._retry) {
//     console.log('run error 401::')

//     originalRequest._retry = true;
//     const refreshToken = Cookies.get('x-refresh-token');

//     if (!refreshToken) {
//       return Promise.reject(error);
//     }

//     try {
//       const response = await apiClient.post('/user/handleRefreshToken', {}, {
//         headers: {
//           'x-client-id': 'Bearer ' + Cookies.get('x-client-id') || '',
//           'x-api-key': 'Bearer ' + Cookies.get('x-api-key') || '',
//           'x-refresh-token': 'Bearer ' + refreshToken
//         }
//       });

//       console.log('response::', response)
//       Cookies.set('authorization', response.data.metadata.tokens.accessToken);
//       Cookies.set('x-refresh-token', response.data.metadata.tokens.refreshToken);
//       originalRequest.headers['authorization'] = response.data.metadata.tokens.accessToken;
//       return apiClient(originalRequest);

//     } catch (error) {
//       return Promise.reject(error);
//     }
//   }
//   return Promise.reject(error);
// });

export default apiClient;
