import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICreateBooking, IUpdateBooking } from 'src/modules/booking/booking.dto';
import { IBookingRepository } from 'src/modules/booking/booking.port';
import { Booking, BookingDocument } from 'src/modules/booking/booking.schema';
import { BookingStatus } from 'src/share/enums';
import { getSelectData } from 'src/share/utils';

@Injectable()
export class BookingRepository implements IBookingRepository {
    constructor(@InjectModel(Booking.name) private readonly BookingModel: Model<Booking>) { }

    async create(bookingCreateDto: ICreateBooking): Promise<BookingDocument> {
        const newBooking = new this.BookingModel(bookingCreateDto)
        const savedBooking = await newBooking.save();
        return savedBooking
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
        return await this.BookingModel.findByIdAndUpdate(id, bookingUpdateDto);
    }

    async updateStatusBooking(id: string, status: BookingStatus): Promise<BookingDocument> {
        const booking = await this.BookingModel.findById(id);
        if (!booking) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Booking not found ${id}`,
                vnMesage: `Không thấy đặt xe ${id}`,
            }, HttpStatus.BAD_REQUEST);
        }

        booking.status = status;
        return await booking.save();
    }

    async deleteBooking(id: string): Promise<void> {
        return await this.BookingModel.findByIdAndDelete(id);
    }
}
