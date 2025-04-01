import {
  bookingParams,
  IBookingDestinationBody,
  IBookingHourBody,
  IBookingScenicRouteBody,
  IBookingSharedItineraryBody,
  ICreateBooking,
  IUpdateBooking,
} from 'src/modules/booking/booking.dto';
import { BookingDocument } from 'src/modules/booking/booking.schema';
import { BookingStatus } from 'src/share/enums';
import { QueryOptions } from 'src/share/interface';

export interface IBookingRepository {
  create(bookingCreateDto: ICreateBooking): Promise<BookingDocument>;
  getBookingById(id: string): Promise<BookingDocument>;
  getBookings(query: object, select: string[], options?: QueryOptions): Promise<BookingDocument[]>;
  findOneBooking(query: object, select: string[]): Promise<BookingDocument>;
  updateBooking(id: string, bookingUpdateDto: IUpdateBooking): Promise<BookingDocument>;
  updateStatusBooking(id: string, status: BookingStatus): Promise<BookingDocument>;
  deleteBooking(id: string): Promise<void>;
}

export interface IBookingService {
  bookingHour(
    customerId: string,
    data: IBookingHourBody,
  ): Promise<{ newBooking: BookingDocument; paymentUrl: string }>;
  bookingScenicRoute(
    customerId: string,
    data: IBookingScenicRouteBody,
  ): Promise<{ newBooking: BookingDocument; paymentUrl: string }>;
  bookingDestination(
    customerId: string,
    data: IBookingDestinationBody,
  ): Promise<{ newBooking: BookingDocument; paymentUrl: string }>;

  bookingSharedItinerary(
    customerId: string,
    data: IBookingSharedItineraryBody,
  ): Promise<{ newBooking: BookingDocument; paymentUrl: string }>;

  payBookingSuccess(bookingCode: number): Promise<BookingDocument>;
  payBookingFail(bookingCode: number): Promise<void>;

  getCustomerPersonalBooking(customerId: string, query: QueryOptions): Promise<BookingDocument[]>;
  getCustomerPersonalBookingById(customerId: string, id: string): Promise<BookingDocument>;

  getListBookingByQuery(query: bookingParams): Promise<BookingDocument[]>;
  getBookingById(id: string): Promise<BookingDocument>;

  totalTransaction(): Promise<number>;
}
