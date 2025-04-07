import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { Routes } from '@/constants/routers'
import { useDebouncedCallback } from '@/hooks/shared/useDebouncedCallback'
import { loginCustomer, verifyOTP } from '@/service/user.service'

type LoginCredentials = {
  phone: string
  code?: string
}

type LoginResponse = {
  isValid: boolean
  token?: {
    accessToken: string
    refreshToken: string
  }
  userId?: string
  data?: string // OTP response data
}

export const useAuth = ({ onLoginSuccess }: { onLoginSuccess?: (data: LoginResponse) => void } = {}) => {
  const router = useRouter()

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
        onLoginSuccess?.(data)
        router.push(Routes.HOME)
      }
    },
  })

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
    logout,
    isLoginPending,
    loginError,
  }
}
