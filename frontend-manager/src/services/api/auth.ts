import axios from './axios';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await axios.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    async logout(): Promise<void> {
        await axios.post('/auth/logout');
        // Clear local storage or any stored tokens
        localStorage.removeItem('token');
    },


    async forgotPassword(email: string) {
        try {
            const response = await axios.post(
                `/auth/forgot-password`,
                { email }
            );
            return response.data;
        } catch (error) {
            console.log("error", error);
            throw error;
        }
    },

    async resetForgotPassword(token: string, newPassword: string) {
        try {
            const response = await axios.post(
                `/auth/reset-forgot-password`,
                {
                    token,
                    newPassword,
                }
            );
            console.log("response", response);
            return response.data;
        } catch (error) {
            console.log("error", error);
            throw error;
        }
    }
};

