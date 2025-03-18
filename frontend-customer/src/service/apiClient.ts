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
  const accessToken = Cookies.get('authorization');
  const clientId = Cookies.get('userId') || Cookies.get('x-client-id');

  if (accessToken) {
    config.headers['authorization'] = 'Bearer ' + accessToken;
  }
  
  if (clientId) {
    config.headers['x-client-id'] = clientId;
  }

  return config;
}, function (error) {
  console.error('Request error:', error);
  return Promise.reject(error);
});

apiClient.interceptors.response.use(function (response) {
  return response;
}, async function (error) {
  const originalRequest = error.config;
  
  // Handle errors without response (e.g. network errors)
  if (!error.response) {
    return Promise.reject(error);
  }
  
  // If error is 401 Unauthorized or 403 Forbidden or JWT expired and this is not a retry
  if ((error.response.status === 401 || 
       error.response.status === 403 || 
       error.response.data?.message === "jwt expired") && 
      !originalRequest._retry) {
    
    originalRequest._retry = true;
    
    const refreshToken = Cookies.get('refreshToken') || Cookies.get('x-refresh-token');
    const clientId = Cookies.get('userId') || Cookies.get('x-client-id');

    if (!refreshToken || !clientId) {
      // Clear cookies and redirect to login if missing tokens
      Cookies.remove('authorization');
      Cookies.remove('refreshToken');
      Cookies.remove('x-refresh-token');
      Cookies.remove('userId');
      Cookies.remove('x-client-id');
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    try {
      const response = await apiClient.post('/auth/refresh', {}, {
        headers: {
          'x-client-id': clientId,
          'x-refresh-token': 'Bearer ' + refreshToken
        }
      });

      if (response.data?.token) {
        // Update cookies with new tokens
        Cookies.set('authorization', response.data.token.accessToken);
        Cookies.set('refreshToken', response.data.token.refreshToken);
        
        // Update the original request with new token and retry
        originalRequest.headers['authorization'] = 'Bearer ' + response.data.token.accessToken;
        return apiClient(originalRequest);
      }
      
      return Promise.reject(error);
    } catch (refreshError) {
      // If refresh fails, clear cookies and redirect to login
      Cookies.remove('authorization');
      Cookies.remove('refreshToken');
      Cookies.remove('x-refresh-token');
      Cookies.remove('userId');
      Cookies.remove('x-client-id');
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return Promise.reject(refreshError);
    }
  }
  
  return Promise.reject(error);
});

export default apiClient;