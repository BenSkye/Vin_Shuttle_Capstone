export enum ServiceType {
  BOOKING_HOUR = 'booking_hour',
  BOOKING_SCENIC_ROUTE = 'booking_scenic_route',
  BOOKING_SHARE = 'booking_share',
  BOOKING_DESTINATION = 'booking_destination',
  BOOKING_BUS_ROUTE = 'booking_bus_route',
}

export const serviceTypeText: Record<ServiceType, string> = {
  [ServiceType.BOOKING_HOUR]: 'Đặt theo giờ',
  [ServiceType.BOOKING_SCENIC_ROUTE]: 'Đặt theo tuyến',
  [ServiceType.BOOKING_SHARE]: 'Đặt chia sẻ',
  [ServiceType.BOOKING_DESTINATION]: 'Đặt điểm đến',
  [ServiceType.BOOKING_BUS_ROUTE]: 'Đặt xe buýt',
};
