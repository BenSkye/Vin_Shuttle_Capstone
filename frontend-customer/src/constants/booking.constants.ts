export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export const bookingStatusColor: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'gold',
  [BookingStatus.CONFIRMED]: 'blue',
  [BookingStatus.CANCELLED]: 'red',
}
export const bookingStatusText: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'Đang chờ',
  [BookingStatus.CONFIRMED]: 'Đã xác  nhận',
  [BookingStatus.CANCELLED]: 'Đã hủy',
}

export const BookingHourDuration = {
  MAX: 300,
  MIN: 15,
} as const

export const SystemOperatingHours = {
  START: 7,
  END: 23,
};

export const BOOKING_BUFFER_MINUTES = 5 as const
