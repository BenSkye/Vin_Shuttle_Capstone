export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum BookingHourDuration {
  MAX = 300,
  MIN = 15,
}

export const BOOKING_BUFFER_MINUTES = 2;
