import { ICreateBooking, IUpdateBooking } from "src/modules/booking/booking.dto";
import { BookingDocument } from "src/modules/booking/booking.schema";
import { PaymentMethod } from "src/share/enums/payment.enum";
import { Position } from "src/share/interface";

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
        startPoint: Position,
        date: string,
        startTime: string,
        durationMinutes: number,
        vehicleCategories: { categoryVehicleId: string; quantity: number }[],
        paymentMethod: PaymentMethod
    ): Promise<BookingDocument>
}