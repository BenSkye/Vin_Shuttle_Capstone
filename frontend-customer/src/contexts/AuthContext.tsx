import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  phone?: string;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize user from cookies on mount
  useEffect(() => {
    const accessToken = Cookies.get('authorization');
    const userId = Cookies.get('userId');

    if (accessToken && userId) {
      try {
        const decodedToken: any = jwtDecode(accessToken);
        setUser({
          id: userId,
          name: decodedToken.name,
          phone: decodedToken.phone,
          email: decodedToken.email
        });
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error decoding token:', error);
        logout();
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    Cookies.remove('authorization');
    Cookies.remove('x-client-id');
    Cookies.remove('refreshToken');
    Cookies.remove('x-refresh-token');
    Cookies.remove('userId');
    Cookies.remove('user');
    router.push('/login');
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = Cookies.get('refreshToken') || Cookies.get('x-refresh-token');
      const userId = Cookies.get('userId') || Cookies.get('x-client-id');

      if (!refreshTokenValue || !userId) {
        logout();
        return false;
      }

      // Here you would make an API call to refresh the token
      // For now, this is a placeholder - you'll need to implement the actual API call
      // const response = await yourApiService.refreshToken(refreshTokenValue, userId);
      
      // Simulating a response structure - replace with your actual implementation
      // if (response.data?.tokens) {
      //   Cookies.set('authorization', response.data.tokens.accessToken, { expires: 1 });
      //   Cookies.set('refreshToken', response.data.tokens.refreshToken, { expires: 7 });
      //   return true;
      // }

      // For now, just return false to indicate refresh failed
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  };

  const getAccessToken = (): string | null => {
    return Cookies.get('authorization') || null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn, 
      login, 
      logout,
      refreshToken,
      getAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
