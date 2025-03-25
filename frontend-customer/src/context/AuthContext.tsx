'use client'

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

import {
  registerIsLoginFalse,
  registerIsLoginTrue,
  registerLogout,
  unregisterIsLoginFalse,
  unregisterIsLoginTrue,
  unregisterLogout,
} from '@/service/user.service'


type User = {
  id: string
  phone?: string
  name?: string
}

type AuthContextType = {
  authUser: User | null
  isLoggedIn: boolean,
  isLoading: boolean,
  login: (
    accessToken: string,
    refreshToken: string | undefined,
    userId: string,
    phone?: string,
    name?: string
  ) => void
  logout: () => void

}

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    setIsLoading(true)
    const token = Cookies.get('authorization')
    const userId = Cookies.get('userId')
    if (token && userId) {
      const decode = jwtDecode(token) as User
      const user: User = {
        id: userId,
        phone: decode.phone,
        name: decode.name,
      }
      setAuthUser(user)
      setIsLoggedIn(true)
    }
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    setIsLoading(true)
    setAuthUser(null)
    setIsLoggedIn(false)
    clearAuthCookies()
    setIsLoading(false)
  }, [])

  const setIsLoginFalse = useCallback(() => {
    setIsLoggedIn(false)
  }, [])

  const setIsLoginTrue = useCallback(() => {
    setIsLoggedIn(true)
  }, [])

  useEffect(() => {
    registerLogout(logout)
    return () => {
      unregisterLogout()
    }
  }, [logout])

  useEffect(() => {
    registerIsLoginFalse(setIsLoginFalse)
    return () => {
      unregisterIsLoginFalse()
    }
  }, [setIsLoginFalse])

  useEffect(() => {
    registerIsLoginTrue(setIsLoginTrue)
    return () => {
      unregisterIsLoginTrue()
    }
  }, [setIsLoginTrue])

  // Login function to set auth state and save to cookies
  const login = async (accessToken: string, refreshToken: string | undefined, userId: string) => {
    // Try to get the name from token if not provided

    Cookies.set('authorization', accessToken, { expires: 2 })
    Cookies.set('refreshToken', refreshToken || '', { expires: 7 })
    Cookies.set('userId', userId, { expires: 7 })

    const decode = (await jwtDecode(accessToken)) as User

    const user: User = {
      id: userId,
      phone: decode.phone,
      name: decode.name,
    }

    // Update state
    setAuthUser(user)
    setIsLoggedIn(true)
    console.log('Login successful, user:', user)
  }

  const clearAuthCookies = () => {
    Cookies.remove('authorization')
    Cookies.remove('refreshToken')
    Cookies.remove('userId')
  }

  const value = {
    authUser,
    isLoggedIn,
    login,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
