'use client'

import React, { useState, useEffect, useContext, createContext, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

// Define types for user and auth data
type User = {
    id: string;
    phone?: string;
    name?: string;
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

    // Load auth data from cookies on initial render and when cookies change
    const loadUserFromCookies = useCallback(() => {
        const accessToken = Cookies.get('authorization');
        const userId = Cookies.get('userId');

        if (accessToken && userId) {
            try {
                const decodedToken: any = jwtDecode(accessToken);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp && decodedToken.exp > currentTime) {
                    // Token is valid
                    const userName = decodedToken.name || "Người dùng";

                    // Set auth state from cookies
                    const user: User = {
                        id: userId,
                        name: userName,
                        phone: decodedToken.phone || undefined
                    };

                    setAuthUser(user);
                    setIsLoggedIn(true);
                    return true;
                } else {
                    // Token expired, clear cookies
                    clearAuthCookies();
                    setAuthUser(null);
                    setIsLoggedIn(false);
                    return false;
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
                return true;
            }
        } else {
            // No valid cookies found
            setAuthUser(null);
            setIsLoggedIn(false);
            return false;
        }
    }, []);

    // Initial load from cookies
    useEffect(() => {
        loadUserFromCookies();
    }, [loadUserFromCookies]);

    // Setup a cookie change observer
    useEffect(() => {
        // Create a function to check for cookie changes
        const checkCookieChanges = () => {
            loadUserFromCookies();
        };

        // Check every 2 seconds
        const interval = setInterval(checkCookieChanges, 2000);

        return () => clearInterval(interval);
    }, [loadUserFromCookies]);

    const clearAuthCookies = () => {
        Cookies.remove('authorization');
        Cookies.remove('refreshToken');
        Cookies.remove('userId');
    }

    // Login function to set auth state and save to cookies
    const login = (accessToken: string, refreshToken: string | undefined, userId: string, phone?: string, name?: string) => {
        // Try to get the name from token if not provided
        let userName = name;
        try {
            const decodedToken: any = jwtDecode(accessToken);
            if (!userName) {
                userName = decodedToken.name || "Người dùng";
            }
        } catch (error) {
            if (!userName) {
                userName = "Người dùng";
            }
            console.error("Error decoding token:", error);
        }

        const user: User = {
            id: userId,
            phone,
            name: userName
        };

        // Update state
        setAuthUser(user);
        setIsLoggedIn(true);

        // Set cookies
        Cookies.set('authorization', accessToken, { expires: 2 });
        if (refreshToken) {
            Cookies.set('refreshToken', refreshToken, { expires: 2 });
        }
        Cookies.set('userId', userId, { expires: 2 });

        console.log("Login successful, user:", user);
    };

    // Logout function to clear auth state and cookies
    const logout = () => {
        setAuthUser(null);
        setIsLoggedIn(false);
        clearAuthCookies();
    };

    // Function to get the current auth token from cookies
    const getAuthToken = (): string | null => {
        return Cookies.get('authorization') || null;
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