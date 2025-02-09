const BASE_PATHS = {
  AUTH: '/auth',
  USERS: '/users',
  VEHICLES: '/vehicles',
  PRICING: '/pricing',
  ROUTES: '/routes',
  BOOKINGS: '/bookings',
  UPLOAD: '/upload'
} as const

export const API_ENDPOINT = {
  AUTH: {
    BASE: BASE_PATHS.AUTH,
    OTP: `${BASE_PATHS.AUTH}/otp`,
    LOGIN: {
      BASE: `${BASE_PATHS.AUTH}/login`,
      CUSTOMER: `${BASE_PATHS.AUTH}/login-customer`,
      PASSWORD: `${BASE_PATHS.AUTH}/login-by-password`
    },
    REGISTER: `${BASE_PATHS.AUTH}/register`,
    FORGOT_PASSWORD: `${BASE_PATHS.AUTH}/forgot-password`,
  },
  USERS: {
    BASE: BASE_PATHS.USERS,
    PROFILE: `${BASE_PATHS.USERS}/profile`,
    DETAIL: (id: string | number) => `${BASE_PATHS.USERS}/${id}`
  },
  VEHICLES: {
    BASE: BASE_PATHS.VEHICLES,
    CATEGORIES: '/vehicle-categories',
    DETAIL: (id: string | number) => `${BASE_PATHS.VEHICLES}/${id}`
  },
  PRICING: {
    VEHICLE: `${BASE_PATHS.PRICING}/vehicle-pricings`
  },
  ROUTES: BASE_PATHS.ROUTES,
  BOOKINGS: BASE_PATHS.BOOKINGS,
  UPLOAD: BASE_PATHS.UPLOAD
} as const