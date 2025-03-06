import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";


interface AuthContextType {
    isLogin: boolean
    isLoading: boolean
    userHaslogin: () => void;
    userHaslogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLogin, setIslogin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            await checkIsLogin();
        };
        fetchData();
    }, []);

    const checkIsLogin = async () => {
        setIsLoading(true); // Bắt đầu loading
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');

            if (!accessToken) {
                setIslogin(false);
                return;
            }

            const decoded = jwtDecode(accessToken);
            const isTokenValid = decoded.exp && decoded.exp * 1000 > Date.now();

            setIslogin(!!isTokenValid);
        } catch (error) {
            setIslogin(false);
        } finally {
            setIsLoading(false); // Kết thúc loading
        }
    }

    const userHaslogin = async () => {
        setIslogin(true);
    };

    const userHaslogout = () => {
        console.log('logout');
        setIslogin(false);
    };

    return (
        <AuthContext.Provider value={{ isLogin, isLoading, userHaslogin, userHaslogout }}>
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
}