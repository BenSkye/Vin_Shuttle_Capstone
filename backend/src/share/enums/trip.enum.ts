import { ServiceType } from "src/share/enums/service-type.enum";

export enum TripStatus {
  BOOKING = 'booking',
  CONFIRMED = 'confirmed',
  PICKUP = 'pickup',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DROPPED_OFF = 'dropped_off',
}

export enum TripCancelBy {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
}

export const GUARANTEED_TIME_BETWEEN_TRIPS = 2; // minutes


export const TripRefundPercent = {
  CUSTOMER: {
    [ServiceType.BOOKING_DESTINATION]: {
      [TripStatus.CONFIRMED]: 1,
      [TripStatus.PICKUP]: 0.5,
    },
    [ServiceType.BOOKING_SHARE]: {
      [TripStatus.CONFIRMED]: 1,
      [TripStatus.PICKUP]: 0.5,
    },
    [ServiceType.BOOKING_HOUR]: {
      [TripStatus.CONFIRMED]: {
        MORE_THAN_1_HOUR: 1,
        LES_THAN_1_HOUR: 0.5,
      },
      [TripStatus.PICKUP]: 0.5,
    },
    [ServiceType.BOOKING_SCENIC_ROUTE]: {
      [TripStatus.CONFIRMED]: {
        MORE_THAN_1_HOUR: 1,
        LES_THAN_1_HOUR: 0.5,
      },
      [TripStatus.PICKUP]: 0.5,
    },
  }
};

