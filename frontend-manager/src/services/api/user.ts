import axiosInstance from "./axios"
import Cookies from 'js-cookie';
import { AxiosError } from 'axios';

export const getCustomer = async () => {
    try {
        const respone = await axiosInstance.get("/users/get-user-by-role/customer");
        console.log("User:", respone.data)
        return respone.data;
    } catch (error) {
        console.error("Error:", error)
    }
}




export const loginUser = async (email: string, password: string) => {
    try {
        const response = await axiosInstance.post("/auth/login-by-password", {
            email, 
            password
        }, {
            validateStatus: function (status) {
                return status >= 200 && status < 500;
            }
        });

        if (response.status === 404) {
            if (response.data?.vnMessage) {
                throw { isCustomError: true, message: response.data.vnMessage };
            }
            throw { isCustomError: true, message: 'Email không tồn tại' };
        }

        if (!response.data) {
            throw { isCustomError: true, message: 'Đã xảy ra lỗi. Vui lòng thử lại.' };
        }

        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response?.data?.isCustomError) {
            throw error;
        }
        throw { isCustomError: true, message: 'Đã xảy ra lỗi. Vui lòng thử lại.' };
    }
}


export const profileUser = async () => {
    try {
        const response = await axiosInstance.get('users/profile');
        console.log('Profile:', response.data);
        return response;
    } catch (error) {
        throw error;
    }
}

export const editProfile = async (data: { name: string, email: string, phone: string }) => {
    try {
        const response = await axiosInstance.put('users/profile', data);
        console.log('Profile:', response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const loginCustomer = async (phoneData: { phone: string }) => {
    try {
        const response = await axiosInstance.post('auth/login-customer', {
            phone: phoneData.phone
        });
        console.log('OTP receiveddddd:', response);
        return response;
    } catch (error) {
        throw error;
    }
}

export const verifyOTP = async (data: { phone: string, code: string }) => {
    try {
        const response = await axiosInstance.post('otp/verify', {
            phone: data.phone,
            code: data.code
        });
        console.log('OTP:', response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
}



let registeredLogout: (() => void) | null = null;

export const registerLogout = (logoutFn: () => void) => {
    registeredLogout = logoutFn;
}

export const unregisterLogout = () => {
    registeredLogout = null;
};

export const executeLogout = () => {
    if (registeredLogout) {
        registeredLogout();
    }
    else {
        Cookies.remove('authorization');
        Cookies.remove('refreshToken');
        Cookies.remove('userId');
    }
};


let setIsLoginFalse: (() => void) | null = null;

export const registerIsLoginFalse = (setIsLoginFalseFn: () => void) => {
    setIsLoginFalse = setIsLoginFalseFn;
}

export const unregisterIsLoginFalse = () => {
    setIsLoginFalse = null;
}

export const executeSetIsLoginFalse = () => {
    if (setIsLoginFalse) {
        console.log('setIsLoginFalse');
        setIsLoginFalse();
    }
}

let setIsLoginTrue: (() => void) | null = null;

export const registerIsLoginTrue = (setIsLoginTrueFn: () => void) => {
    setIsLoginTrue = setIsLoginTrueFn;
}

export const unregisterIsLoginTrue = () => {
    setIsLoginTrue = null;
}

export const executeSetIsLoginTrue = () => {
    if (setIsLoginTrue) {
        console.log('setIsLoginTrue');
        setIsLoginTrue();
    }
}