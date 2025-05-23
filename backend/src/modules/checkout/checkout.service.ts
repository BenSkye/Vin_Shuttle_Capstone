import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CheckoutResponseDataType } from '@payos/node/lib/type';
import { BOOKING_REPOSITORY, BOOKING_SERVICE } from 'src/modules/booking/booking.di-token';
import { IBookingRepository, IBookingService } from 'src/modules/booking/booking.port';
import { BookingDocument } from 'src/modules/booking/booking.schema';
import { ICheckoutService } from 'src/modules/checkout/checkout.port';
import { TRIP_REPOSITORY, TRIP_SERVICE } from 'src/modules/trip/trip.di-token';
import { ITripRepository, ITripService } from 'src/modules/trip/trip.port';
import { MOMO_PROVIDER, PAYOS_PROVIDER } from 'src/share/di-token';
import { IMomoService, IPayosService } from 'src/share/share.port';


@Injectable()
export class CheckoutService implements ICheckoutService {
  constructor(
    @Inject(forwardRef(() => BOOKING_REPOSITORY))
    private readonly bookingRepository: IBookingRepository,
    @Inject(forwardRef(() => BOOKING_SERVICE))
    private readonly bookingService: IBookingService,
    @Inject(PAYOS_PROVIDER)
    private readonly payosService: IPayosService,
    @Inject(MOMO_PROVIDER)
    private readonly momoService: IMomoService, // Replace with actual type if available
    @Inject(TRIP_SERVICE)
    private readonly tripService: ITripService,
  ) { }

  async CheckoutBooking(bookingId: string): Promise<CheckoutResponseDataType> {
    const booking = await this.bookingRepository.getBookingById(bookingId);
    if (!booking) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'booking is not exist',
          vnMessage: 'Không tìm thấy đặt xe',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const paymentResult = await this.payosService.createPaymentLink({
      bookingCode: booking.bookingCode,
      amount: booking.totalAmount,
      description: `Đặt xe ${booking.bookingCode}`,
      cancelUrl: '/cancel-booking-payment',
      returnUrl: '/return-booking-payment',
    });
    console.log('paymentResult', paymentResult);
    return paymentResult;
  }

  async getPayOsReturn(reqQuery: any): Promise<BookingDocument> {
    console.log('reqQuery', reqQuery);
    let booking;
    if (reqQuery.code === '00') {
      booking = await this.bookingService.payBookingSuccess(reqQuery.orderCode);
    } else {
      await this.bookingService.payBookingFail(reqQuery.orderCode);
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Payment failed`,
          vnMessage: `Thanh toán thất bại`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return booking;
  }

  async getPayOsCancel(reqQuery: any): Promise<void> {
    console.log('reqQuery', reqQuery);
    await this.bookingService.payBookingFail(reqQuery.orderCode);
  }

  async CheckoutBookingMomo(bookingId: string): Promise<any> {
    const booking = await this.bookingRepository.getBookingById(bookingId);
    if (!booking) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'booking is not exist',
          vnMessage: 'Không tìm thấy đặt xe',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const paymentResult = await this.momoService.createPaymentLink({
      bookingCode: booking.bookingCode,
      amount: booking.totalAmount,
      description: `Đặt xe ${booking.bookingCode}`,
      cancelUrl: '/cancel-booking-payment',
      returnUrl: '/return-booking-payment',
    });
    console.log('paymentResult', paymentResult);
    return paymentResult;
  }

  async momoCalbackReturn(reqBody: any): Promise<boolean> {
    console.log('reqBody94', reqBody);
    if (reqBody.resultCode === 0) {
      const booking = await this.bookingService.payBookingSuccess(reqBody.orderId);
      const updatedBooking = await this.bookingRepository.updateBooking(booking._id.toString(), {
        transId: reqBody.transId,
      })
      console.log('booking', updatedBooking);
      return true;
    } else {
      await this.bookingService.payBookingFail(reqBody.orderId);
      return false;
    }
  }

  async momoTransferTripCalbackReturn(reqBody: any): Promise<boolean> {
    console.log('reqBody', reqBody);
    if (reqBody.resultCode === 0) {
      const extraData = Buffer.from(reqBody.extraData, 'base64').toString('utf-8');
      const tripIds = JSON.parse(extraData).tripIds;
      const updatedTrips = await this.tripService.transferTripAmountSuccess(
        tripIds
      );
      console.log('updatedTrips', updatedTrips);
      return true;
    } else {
      return false;
    }
  }
}
