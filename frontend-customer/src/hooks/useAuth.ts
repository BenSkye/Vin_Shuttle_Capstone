import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { message } from 'antd'

import { Routes } from '@/constants/routers'
import { useDebouncedCallback } from '@/hooks/shared/useDebouncedCallback'
import { loginCustomer, registerCustomer, verifyOTP } from '@/service/user.service'
import { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse, ApiError } from '@/interface/auth.interface'

export const useAuth = ({
  onLoginSuccess,
}: {
  onLoginSuccess?: (data: LoginResponse) => void
} = {}) => {
  const router = useRouter()
  const [messageApi] = message.useMessage()
  const successMessageRef = useRef<{ content: string; duration: number } | null>(null)
  const errorMessageRef = useRef<{ content: string; duration: number } | null>(null)

  useEffect(() => {
    if (successMessageRef.current) {
      messageApi.success(successMessageRef.current)
      successMessageRef.current = null
    }
  }, [messageApi])

  useEffect(() => {
    if (errorMessageRef.current) {
      messageApi.error(errorMessageRef.current)
      errorMessageRef.current = null
    }
  }, [messageApi])

  // Login mutation
  const { mutate: loginMutate, isPending: isLoginPending, error: loginError } = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      if (!credentials.code) {
        // First step: Send OTP
        const response = await loginCustomer({ phone: credentials.phone })
        return { isValid: true, data: response.data }
      } else {
        // Second step: Verify OTP
        const response = await verifyOTP({ phone: credentials.phone, code: credentials.code })
        return response
      }
    },
    onSuccess: (data) => {
      if (data.isValid && data.token) {
        successMessageRef.current = {
          content: 'Đăng nhập thành công! Đang chuyển hướng...',
          duration: 1
        }
        setTimeout(() => {
          onLoginSuccess?.(data)
          router.push(Routes.HOME)
        }, 1000)
      }
    },
    onError: (error: unknown) => {
      const err = error as ApiError
      const errorMessage = err?.response?.data?.vnMessage || err?.vnMessage || 'Có lỗi xảy ra. Vui lòng thử lại.'
      errorMessageRef.current = {
        content: errorMessage,
        duration: 5,
      }
    }
  })

  // Register mutation
  const { mutate: registerMutate, isPending: isRegisterPending, error: registerError } = useMutation({
    mutationFn: async (data: RegisterCredentials): Promise<RegisterResponse> => {
      const response = await registerCustomer(data)
      return response
    },
    onSuccess: () => {
      successMessageRef.current = {
        content: 'Đăng ký thành công! Chuyển đến trang đăng nhập...',
        duration: 2
      }
      setTimeout(() => {
        router.push(Routes.AUTH.LOGIN)
      }, 1000)
    },
    onError: (error: unknown) => {
      const err = error as ApiError
      const errorMessage = err?.response?.data?.vnMessage || err?.vnMessage || 'Có lỗi xảy ra. Vui lòng thử lại.'
      errorMessageRef.current = {
        content: errorMessage,
        duration: 5,
      }
    }
  })

  const handleRegister = async (data: RegisterCredentials): Promise<RegisterResponse> => {
    return new Promise((resolve, reject) => {
      registerMutate(data, {
        onSuccess: (data) => resolve(data),
        onError: (error) => reject(error),
      })
    })
  }

  const doRegister = useDebouncedCallback(handleRegister)

  const handleLogin = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return new Promise((resolve, reject) => {
      loginMutate(credentials, {
        onSuccess: (data) => resolve(data),
        onError: (error) => reject(error),
      })
    })
  }

  const doLogin = useDebouncedCallback(handleLogin)

  const logout = useCallback(() => {
    router.push(Routes.AUTH.LOGIN)
  }, [router])

  return {
    doLogin,
    doRegister,
    logout,
    isLoginPending,
    isRegisterPending,
    loginError,
    registerError,
  }
}
