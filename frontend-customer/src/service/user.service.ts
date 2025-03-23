import Cookies from 'js-cookie'

import apiClient from './apiClient'

export const loginCustomer = async (phoneData: { phone: string }) => {
  try {
    const response = await apiClient.post('auth/login-customer', {
      phone: phoneData.phone,
    })
    console.log('OTP receiveddddd:', response)
    return response
  } catch (error) {
    throw error
  }
}

export const verifyOTP = async (data: { phone: string; code: string }) => {
  try {
    const response = await apiClient.post('otp/verify', {
      phone: data.phone,
      code: data.code,
    })
    console.log('OTP:', response.data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const profileUser = async () => {
  try {
    const response = await apiClient.get('users/profile')
    console.log('Profile:', response.data)
    return response
  } catch (error) {
    throw error
  }
}

export const editProfile = async (data: { name: string; email: string; phone: string }) => {
  try {
    const response = await apiClient.put('users/profile', data)
    console.log('Profile:', response.data)
    return response.data
  } catch (error) {
    throw error
  }
}

let registeredLogout: (() => void) | null = null

export const registerLogout = (logoutFn: () => void) => {
  registeredLogout = logoutFn
}

export const unregisterLogout = () => {
  registeredLogout = null
}

export const executeLogout = () => {
  if (registeredLogout) {
    registeredLogout()
  } else {
    Cookies.remove('authorization')
    Cookies.remove('refreshToken')
    Cookies.remove('userId')
  }
}

let setIsLoginFalse: (() => void) | null = null

export const registerIsLoginFalse = (setIsLoginFalseFn: () => void) => {
  setIsLoginFalse = setIsLoginFalseFn
}

export const unregisterIsLoginFalse = () => {
  setIsLoginFalse = null
}

export const executeSetIsLoginFalse = () => {
  if (setIsLoginFalse) {
    console.log('setIsLoginFalse')
    setIsLoginFalse()
  }
}

let setIsLoginTrue: (() => void) | null = null

export const registerIsLoginTrue = (setIsLoginTrueFn: () => void) => {
  setIsLoginTrue = setIsLoginTrueFn
}

export const unregisterIsLoginTrue = () => {
  setIsLoginTrue = null
}

export const executeSetIsLoginTrue = () => {
  if (setIsLoginTrue) {
    console.log('setIsLoginTrue')
    setIsLoginTrue()
  }
}
