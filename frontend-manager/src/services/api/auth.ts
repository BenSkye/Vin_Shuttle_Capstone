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
};

