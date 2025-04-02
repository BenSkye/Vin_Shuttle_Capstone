export enum TripStatus {
  BOOKING = 'booking',
  PAYED = 'payed',
  PICKUP = 'pickup',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const tripStatusColor: Record<TripStatus, string> = {
  [TripStatus.BOOKING]: 'gold',
  [TripStatus.PAYED]: 'blue',
  [TripStatus.PICKUP]: 'green',
  [TripStatus.IN_PROGRESS]: 'red',
  [TripStatus.COMPLETED]: 'red',
  [TripStatus.CANCELLED]: 'red',
};

export const tripStatusText: Record<TripStatus, string> = {
  [TripStatus.BOOKING]: 'Đang đặt',
  [TripStatus.PAYED]: 'Đã thanh toán',
  [TripStatus.PICKUP]: 'Đang đón',
  [TripStatus.IN_PROGRESS]: 'Đang trong chuyến đi',
  [TripStatus.COMPLETED]: 'Đã hoàn thành',
  [TripStatus.CANCELLED]: 'Đã hủy',
};

export enum SharedRouteStatus {
  PENDING = 'pending',
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SharedRouteStopsType {
  START_POINT = 'startPoint',
  END_POINT = 'endPoint',
}