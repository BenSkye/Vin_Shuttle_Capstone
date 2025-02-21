import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ICreateBooking, IUpdateBooking } from "src/modules/booking/booking.dto";
import { IBookingRepository } from "src/modules/booking/booking.port";
import { Booking, BookingDocument } from "src/modules/booking/booking.schema";
import { getSelectData } from "src/share/utils";

@Injectable()
export class BookingRepository implements IBookingRepository {
    constructor(
        @InjectModel(Booking.name) private readonly BookingModel: Model<Booking>
    ) { }

    async create(bookingCreateDto: ICreateBooking): Promise<BookingDocument> {
        const newBooking = new this.BookingModel(bookingCreateDto)
        return await newBooking.save()
    }
    async getBookingById(id: string): Promise<BookingDocument> {
        return await this.BookingModel.findById(id)
    }
    async getBookings(query: object, select: string[]): Promise<BookingDocument[]> {
        return await this.BookingModel.find(query).select(getSelectData(select))
    }
    async findOneBooking(query: object, select: string[]): Promise<BookingDocument> {
        return await this.BookingModel.findOne(query).select(getSelectData(select))
    }

    async updateBooking(id: string, bookingUpdateDto: IUpdateBooking): Promise<BookingDocument> {
        return await this.BookingModel.findByIdAndUpdate(id, bookingUpdateDto)
    }

}