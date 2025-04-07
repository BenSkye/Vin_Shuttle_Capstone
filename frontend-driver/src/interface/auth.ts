export interface LoginResponse {
  isValid: boolean;
  token?: {
    accessToken: string;
    refreshToken: string;
  };
  userId?: string;
  roleError?: boolean;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
