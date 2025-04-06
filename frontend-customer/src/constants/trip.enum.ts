export enum TripStatus {
  BOOKING = 'booking',
  CONFIRMED = 'confirmed',
  PICKUP = 'pickup',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const tripStatusColor: Record<TripStatus, string> = {
  [TripStatus.BOOKING]: 'gold',
  [TripStatus.CONFIRMED]: 'blue',
  [TripStatus.PICKUP]: 'green',
  [TripStatus.IN_PROGRESS]: 'red',
  [TripStatus.COMPLETED]: 'red',
  [TripStatus.CANCELLED]: 'red',
}

export const tripStatusText: Record<TripStatus, string> = {
  [TripStatus.BOOKING]: 'Đang đặt',
  [TripStatus.CONFIRMED]: 'Đã xác  nhận',
  [TripStatus.PICKUP]: 'Đang đón',
  [TripStatus.IN_PROGRESS]: 'Đang trong chuyến đi',
  [TripStatus.COMPLETED]: 'Đã hoàn thành',
  [TripStatus.CANCELLED]: 'Đã hủy',
}



export enum TripCancelBy {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
}

export const tripCancelText: Record<TripCancelBy, string> = {
  [TripCancelBy.CUSTOMER]: 'Khách hàng hủy chuyến',
  [TripCancelBy.DRIVER]: 'Tài xế hủy chuyến',
}