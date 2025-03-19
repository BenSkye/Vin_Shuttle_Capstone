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
        // Only read from cookies instead of localStorage
        const accessToken = Cookies.get('authorization');
        const userId = Cookies.get('userId');

        if (accessToken && userId) {
            // Check if token is expired
            try {
                const decodedToken: any = jwtDecode(accessToken);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp && decodedToken.exp > currentTime) {
                    // Token is valid, extract name from token if available
                    let userName = "Người dùng";
                    if (decodedToken.name) {
                        userName = decodedToken.name;
                    }

                    // Set auth state from cookies
                    const user: User = {
                        id: userId,
                        name: userName
                    };

                    setAuthUser(user);
                    setIsLoggedIn(true);
                } else {
                    // Token expired, clear cookies
                    Cookies.remove('authorization');
                    Cookies.remove('refreshToken');
                    Cookies.remove('userId');
                    setAuthUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Error decoding token from cookie:", error);

                // If token can't be decoded but exists, still set the user
                const user: User = {
                    id: userId,
                    name: "Người dùng"
                };

                setAuthUser(user);
                setIsLoggedIn(true);
            }
        } else {
            // No valid cookies found
            setAuthUser(null);
            setIsLoggedIn(false);
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