import { CheckoutResponseDataType } from '@payos/node/lib/type';
import { BookingDocument } from 'src/modules/booking/booking.schema';

export interface ICheckoutService {
  CheckoutBooking(bookingId: string): Promise<CheckoutResponseDataType>;
  getPayOsReturn(reqQuery: any): Promise<BookingDocument>;
  getPayOsCancel(reqQuery: any): Promise<void>;
}
