import { executeLogout, executeSetIsLoginFalse, executeSetIsLoginTrue } from '@/service/user.service';
import axios from 'axios';
import Cookies from 'js-cookie';


const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
});

apiClient.interceptors.request.use(function (config) {

  config.headers['x-client-id'] = Cookies.get('userId') || '';
  config.headers['authorization'] = 'Bearer ' + Cookies.get('authorization') || '';

  return config;
}, function (error) {
  error.log('error::', error)
  return Promise.reject(error);
});

apiClient.interceptors.response.use(function (response) {
  return response;
},
  async function (error) {
    const originalRequest = error.config;
    console.log('error::', error)
    if ((error.response.status === 450) && !originalRequest._retry) {
      console.log('run error 450::')

      originalRequest._retry = true;
      const refreshToken = Cookies.get('refreshToken');

      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        executeSetIsLoginFalse();
        const response = await apiClient.post('/auth/refresh-token', {}, {
          headers: {
            'x-client-id': Cookies.get('userId') || '',
            'x-refresh-token': refreshToken
          }
        });

        console.log('response::', response)
        Cookies.set('authorization', response.data.accessToken, { expires: 2 });
        Cookies.set('refreshToken', response.data.refreshToken, { expires: 7 });
        executeSetIsLoginTrue();
        originalRequest.headers['authorization'] = response.data.metadata.tokens.accessToken;
        return apiClient(originalRequest);

      } catch (error) {
        return Promise.reject(error);
      }
    }
    if (error.response.status === 401 || error.response.status === 403) {
      executeLogout();
    } {
      return Promise.reject(error);
    }
  }
);

export default apiClient;