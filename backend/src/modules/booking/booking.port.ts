import { IBookingHourBody, ICreateBooking, IUpdateBooking } from "src/modules/booking/booking.dto";
import { BookingDocument } from "src/modules/booking/booking.schema";


export interface IBookingRepository {
    create(bookingCreateDto: ICreateBooking): Promise<BookingDocument>
    getBookingById(id: string): Promise<BookingDocument>
    getBookings(query: object, select: string[]): Promise<BookingDocument[]>
    findOneBooking(query: object, select: string[]): Promise<BookingDocument>
    updateBooking(id: string, bookingUpdateDto: IUpdateBooking): Promise<BookingDocument>
}

export interface IBookingService {
    bookingHour(
        customerId: string,
        data: IBookingHourBody
    ): Promise<BookingDocument>
}