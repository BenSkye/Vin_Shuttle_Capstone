import { BookingStatus } from 'src/share/enums';
import { PaymentMethod } from 'src/share/enums/payment.enum';
import { QueryOptions, StartOrEndPoint } from 'src/share/interface';

export interface ICreateBooking {
  bookingCode: number;
  customerId: string;
  trips: string[];
  totalAmount: number;
  paymentMethod: string;
}

export interface IUpdateBooking {
  bookingCode?: string;
  customerId?: string;
  trips?: string[];
  totalAmount?: number;
  paymentMethod?: string;
  //InvoiceId?: string
  cancellationTime?: string;
  cancellationReason?: string;
  statusHistory?: object;
  transId?: string;
}

export interface IBookingHourBody {
  startPoint: StartOrEndPoint;
  date: string;
  startTime: string;
  durationMinutes: number;
  vehicleCategories: { categoryVehicleId: string; name: string; quantity: number }[];
  paymentMethod: PaymentMethod;
}

export interface IBookingScenicRouteBody {
  startPoint: StartOrEndPoint;
  scenicRouteId: string;
  date: string;
  startTime: string;
  vehicleCategories: { categoryVehicleId: string; name: string; quantity: number }[];
  paymentMethod: PaymentMethod;
}
export interface IBookingDestinationBody {
  startPoint: StartOrEndPoint;
  endPoint: StartOrEndPoint;
  durationEstimate: number;
  distanceEstimate: number;
  vehicleCategories: { categoryVehicleId: string; name: string };
  paymentMethod: PaymentMethod;
}

export interface IBookingSharedItineraryBody {
  startPoint: StartOrEndPoint;
  endPoint: StartOrEndPoint;
  durationEstimate: number;
  distanceEstimate: number;
  numberOfSeat: number;
  paymentMethod: PaymentMethod;
}

export interface bookingParams extends QueryOptions {
  status?: BookingStatus;
  customerId?: string;
  bookingCode?: number;
  paymentMethod?: PaymentMethod;
}
