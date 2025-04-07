export interface LoginCredentials {
  phone: string
  code?: string
}

export interface RegisterCredentials {
  name: string
  phone: string
}

export interface LoginResponse {
  isValid: boolean
  token?: {
    accessToken: string
    refreshToken: string
  }
  userId?: string
  data?: string
}

export interface RegisterResponse {
  _id: string
  name: string
  phone: string
  role: string
}

export interface ApiError {
  response?: {
    data?: {
      statusCode?: number
      message?: string
      vnMessage?: string
    }
  }
  vnMessage?: string
  message?: string
}

export interface UseAuthProps {
  onLoginSuccess?: (data: LoginResponse) => void
} 