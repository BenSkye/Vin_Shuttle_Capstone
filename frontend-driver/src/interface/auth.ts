export interface LoginResponse {
  isValid: boolean;
  token: {
    accessToken: string;
    refreshToken: string;
  };
  userId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
