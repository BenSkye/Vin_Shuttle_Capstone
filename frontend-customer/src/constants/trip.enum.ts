export enum TripStatus {
  BOOKING = 'booking',
  CONFIRMED = 'confirmed',
  PICKUP = 'pickup',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DROPPED_OFF = 'dropped_off',
}

export const tripStatusColor: Record<TripStatus, string> = {
  [TripStatus.BOOKING]: 'gold',
  [TripStatus.CONFIRMED]: 'purple',
  [TripStatus.PICKUP]: 'green',
  [TripStatus.IN_PROGRESS]: 'yellow',
  [TripStatus.COMPLETED]: 'red',
  [TripStatus.CANCELLED]: 'red',
  [TripStatus.DROPPED_OFF]: 'grey',
}

export const tripStatusText: Record<TripStatus, string> = {
  [TripStatus.BOOKING]: 'Đang đặt',
  [TripStatus.CONFIRMED]: 'Đã xác  nhận',
  [TripStatus.PICKUP]: 'Đang đón',
  [TripStatus.IN_PROGRESS]: 'Đang trong cuốc xe',
  [TripStatus.COMPLETED]: 'Đã hoàn thành',
  [TripStatus.CANCELLED]: 'Đã hủy',
  [TripStatus.DROPPED_OFF]: 'Không thực hiện',
}

export enum TripCancelBy {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
}

export const tripCancelText: Record<TripCancelBy, string> = {
  [TripCancelBy.CUSTOMER]: 'Khách hàng hủy chuyến',
  [TripCancelBy.DRIVER]: 'Tài xế hủy chuyến',
}
