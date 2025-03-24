import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '~/interface/user';
import { deleteUserPushToken } from '~/services/userServices';
import { handleNotification } from '~/utils/handleNotification';

interface AuthContextType {
  isLogin: boolean;
  isLoading: boolean;
  user: User | null;
  userHaslogin: () => void;
  userHaslogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLogin, setIslogin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      await checkIsLogin();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isLogin) {
      handleNotification();
    }
  }, [isLogin]);

  const checkIsLogin = async () => {
    setIsLoading(true); // Bắt đầu loading
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');
      
      console.log('accessToken', accessToken);
      console.log('userId', userId);
      
      if (!accessToken || !userId) {
        setIslogin(false);
        return;
      }
  
      const decoded = await jwtDecode(accessToken);
      console.log('decoded', decoded);
      
      // Kiểm tra xem userId trong token có khớp với userId lưu trong AsyncStorage không
      if (decoded._id !== userId) {
        console.log('User ID mismatch');
        setIslogin(false);
        return;
      }
      
      setUser({
        id: decoded._id,
        name: decoded.name,
      });
      
      const isTokenValid = decoded.exp && decoded.exp * 1000 > Date.now();
      setIslogin(!!isTokenValid);
    } catch (error) {
      console.error('Error checking login state:', error);
      setIslogin(false);
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  const userHaslogin = async () => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const userId = await AsyncStorage.getItem('userId');
        
        if (accessToken && userId) {
            // Decode token để lấy thông tin user
            const decoded = jwtDecode(accessToken);
            
            // Cập nhật state user
            setUser({
                id: decoded._id || userId,
                name: decoded.name || '',
            });
            
            setIslogin(true);
        } else {
            console.error('Missing token or userId in userHaslogin');
            setIslogin(false);
        }
    } catch (error) {
        console.error('Error in userHaslogin:', error);
        setIslogin(false);
    }
};

  const userHaslogout = async () => {
    console.log('Starting logout process');
    try {
      // 1. Thử xóa push token trước khi xóa thông tin đăng nhập
      try {
        console.log('Attempting to delete push token');
        await deleteUserPushToken();
        console.log('Push token deleted or not present');
      } catch (e) {
        console.log('Error removing push token, but continuing logout process:', e);
      }
  
      // 2. Xóa token và user info
      console.log('Removing auth tokens and user info');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userId');
  
      // 3. Cập nhật state
      console.log('Updating auth state');
      setUser(null);
      setIslogin(false);
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Error during logout process:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLogin, isLoading, user, userHaslogin, userHaslogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
