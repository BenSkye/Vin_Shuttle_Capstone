import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: 'http://localhost:2028',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(function (config) {
  config.headers['x-client-id'] = 'Bearer ' + Cookies.get('x-client-id') || '';
  config.headers['authorization'] = 'Bearer ' + Cookies.get('authorization') || '';

  return config;
}, function (error) {
  return Promise.reject(error);
});

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