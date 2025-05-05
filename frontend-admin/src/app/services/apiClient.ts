import axios from 'axios';
import { notification } from 'antd';

// Lưu giá trị để tránh nhiều thông báo cùng lúc
let isLoggingOut = false;

// Hàm xử lý logout toàn cục
export const handleGlobalLogout = () => {
  if (isLoggingOut) return;
  
  isLoggingOut = true;
  
  // Hiển thị thông báo
  notification.error({
    message: 'Phiên làm việc đã hết hạn',
    description: 'Vui lòng đăng nhập lại để tiếp tục.',
    duration: 3,
  });
  
  // Xóa thông tin đăng nhập
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  
  // Tạo event để thông báo cho các component khác
  window.dispatchEvent(new Event('storage'));
  
  // Chuyển đến trang đăng nhập sau 1 khoảng thời gian ngắn
  setTimeout(() => {
    window.location.href = '/login';
    isLoggingOut = false;
  }, 1500);
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor (giữ nguyên như cũ)
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      
      if (accessToken && userId) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
        config.headers['x-client-id'] = userId;
      }
      return config;
    } catch (error) {
      console.error('Error getting accessToken from localStorage:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor (thêm mới)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Kiểm tra lỗi 450 (token hết hạn nhưng có refresh token)
    if (error.response?.status === 450 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      const userId = localStorage.getItem('userId');
      
      if (!refreshToken || !userId) {
        handleGlobalLogout();
        return Promise.reject(error);
      }
      
      try {
        // Gọi API refresh token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/refresh-token`,
          {},
          {
            headers: {
              'x-client-id': userId,
              'x-refresh-token': refreshToken,
            },
          }
        );
        
        // Lưu token mới
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Cập nhật token trong request ban đầu và thử lại
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        handleGlobalLogout();
        return Promise.reject(refreshError);
      }
    }
    
    // Xử lý lỗi 401 hoặc 403 (không có quyền hoặc token không hợp lệ)
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleGlobalLogout();
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;