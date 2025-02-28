export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
}

export const bookingStatusColor: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'gold',
    [BookingStatus.CONFIRMED]: 'blue',
    [BookingStatus.COMPLETED]: 'green',
    [BookingStatus.CANCELLED]: 'red',
    [BookingStatus.PAYMENT_FAILED]: 'error',
};

export const BookingHourDuration = {
    MAX: 300,
    MIN: 15
} as const;

export const BOOKING_BUFFER_MINUTES = 2 as const;
