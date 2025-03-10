export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum BookingHourDuration {
  MAX = 300,
  MIN = 15,
}

export const BOOKING_BUFFER_MINUTES = 2;
