export enum TripStatus {
  BOOKING = 'booking',
  PAYED = 'payed',
  PICKUP = 'pickup',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DROPPED_OFF = 'dropped_off',
}

export enum TripCancelBy {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
}

export const GUARANTEED_TIME_BETWEEN_TRIPS = 2; // minutes