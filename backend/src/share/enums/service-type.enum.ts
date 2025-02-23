export enum ServiceType {
    BOOKING_HOUR = 'booking_hour',
    BOOKING_SCENIC_ROUTE = 'booking_scenic_route',
    BOOKING_SHARE = 'booking_share',
    BOOKING_DESTINATION = 'booking_destination'
}

export enum BookingHourDuration {
    MAX = 300,
    MIN = 15
}

export const BOOKING_BUFFER_MINUTES = 2
