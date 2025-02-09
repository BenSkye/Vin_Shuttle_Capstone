export const ROUTERS = {
  AUTH: {
    OTP: '/otp',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  MANAGE: {
    USERS: {
      MANAGE: '/manage/users',
      PROFILE: '/profile',
  },
  DASHBOARD: '/dashboard',
    VEHICLES: {
      CATEGORIES: '/manage/vehicles'
    },
    PRICING: {
      VEHICLE: '/manage/pricing/vehicle-pricings',
      SERVICE: '/manage/pricing/service-pricings'
    },
    ROUTES: {
      BASE: '/manage/routes'
    },
    BOOKINGS: {
      BASE: '/manage/bookings'
    },
  }
} as const