'use client'

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; // Add this import

// Define types for user and auth data
type User = {
    id: string;       // userId 
    phone?: string;   // Optional, from LoginPage
    name?: string;    // Decoded from JWT or set directly
};

type AuthData = {
    accessToken: string;
    refreshToken?: string;
    user: User;
};

type AuthContextType = {
    authUser: User | null;
    setAuthUser: React.Dispatch<React.SetStateAction<User | null>>;
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    login: (accessToken: string, refreshToken: string | undefined, userId: string, phone?: string, name?: string) => void;
    logout: () => void;
    getAuthToken: () => string | null;
};

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const AUTH_STORAGE_KEY = 'vinshuttle_auth';

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    // Load auth data from localStorage or cookies on initial render
    useEffect(() => {
        // First try from localStorage
        const storedAuthData = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuthData) {
            try {
                const authData: AuthData = JSON.parse(storedAuthData);
                // Optional: Check if token is expired
                try {
                    const decodedToken: any = jwtDecode(authData.accessToken);
                    const currentTime = Date.now() / 1000;

                    if (decodedToken.exp && decodedToken.exp > currentTime) {
                        // Token is still valid
                        setAuthUser(authData.user);
                        setIsLoggedIn(true);
                    } else {
                        // Token expired, clear storage
                        localStorage.removeItem(AUTH_STORAGE_KEY);
                        setAuthUser(null);
                        setIsLoggedIn(false);
                    }
                } catch {
                    // If token can't be decoded, assume it's still valid
                    setAuthUser(authData.user);
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.error("Error parsing auth data from localStorage:", error);
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        } else {
            // If not in localStorage, try from cookies
            const accessToken = Cookies.get('authorization');
            const userId = Cookies.get('userId');

            if (accessToken && userId) {
                // Try to get user name from token
                let userName = "Người dùng";
                try {
                    const decodedToken: any = jwtDecode(accessToken);
                    if (decodedToken.name) {
                        userName = decodedToken.name;
                    }
                } catch (error) {
                    console.error("Error decoding token from cookie:", error);
                }

                // Set auth state from cookies
                const user: User = {
                    id: userId,
                    name: userName
                };

                setAuthUser(user);
                setIsLoggedIn(true);

                // Also save to localStorage for consistency
                const refreshToken = Cookies.get('refreshToken') || undefined;
                const authData: AuthData = {
                    accessToken,
                    refreshToken,
                    user
                };
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
            }
        }
    }, []);

    // Login function to set auth state and save to localStorage
    const login = (accessToken: string, refreshToken: string | undefined, userId: string, phone?: string, name?: string) => {
        // Try to get the name from token if not provided
        let userName = name;
        if (!userName) {
            try {
                const decodedToken: any = jwtDecode(accessToken);
                userName = decodedToken.name || "Người dùng";
            } catch (error) {
                userName = "Người dùng";
                console.error("Error decoding token:", error);
            }
        }

        const user: User = {
            id: userId,
            phone,
            name: userName
        };

        // Update state
        setAuthUser(user);
        setIsLoggedIn(true);

        // Save to localStorage
        const authData: AuthData = {
            accessToken,
            refreshToken,
            user
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    };

    // Logout function to clear auth state and localStorage
    const logout = () => {
        setAuthUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    };

    // Function to get the current auth token
    const getAuthToken = (): string | null => {
        const storedAuthData = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuthData) {
            try {
                const authData: AuthData = JSON.parse(storedAuthData);
                return authData.accessToken;
            } catch {
                return null;
            }
        }
        return null;
    };

    const value = {
        authUser,
        setAuthUser,
        isLoggedIn,
        setIsLoggedIn,
        login,
        logout,
        getAuthToken
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}