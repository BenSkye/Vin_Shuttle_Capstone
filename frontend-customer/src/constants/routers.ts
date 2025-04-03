export const Routes = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
  },
  BOOKING: {
    ROOT: '/booking',
    DETAIL: '/booking/:id',
  },
  RIDE: {
    ROOT: '/ride',
    DESTINATION: '/ride/destination',
    ROUTES: '/ride/routes',
    HOURLY: '/ride/hourly',
    SHARED: '/ride/shared',
    BUS: '/ride/bus',
  },
  FEATURES: '/features',
  PROFILE: '/profile',
  TRIPS: '/trips',
  NOTIFICATIONS: '/notifications',
  CONVERSATIONS: '/conversations',
  ABOUT: '/aboutus',
  PRICING: '/pricing',
  CONTACT: '/contact',
  STATIC_CONTENT: {
    TERMS: '/terms',
    PRIVACY: '/privacy',
    USER_GUIDE: '/user-guide',
  },
  CHAT: '/conversations',
  FAQ: '/faq',
}
