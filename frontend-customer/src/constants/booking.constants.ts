export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}


export const bookingStatusColor: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'gold',
    [BookingStatus.CONFIRMED]: 'blue',
    [BookingStatus.COMPLETED]: 'green',
    [BookingStatus.CANCELLED]: 'red',
};
export const bookingStatusText: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'Đang chờ',
    [BookingStatus.CONFIRMED]: 'Đã thanh toán',
    [BookingStatus.COMPLETED]: 'Đã hoàn thành',
    [BookingStatus.CANCELLED]: 'Đã hủy',
}

export const BookingHourDuration = {
    MAX: 300,
    MIN: 15
} as const;

export const BOOKING_BUFFER_MINUTES = 2 as const;
