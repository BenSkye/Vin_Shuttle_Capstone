import { Controller, Get, HttpCode, HttpStatus, Inject, Param } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { BOOKING_SERVICE } from "src/modules/booking/booking.di-token";
import { IBookingService } from "src/modules/booking/booking.port";

@Controller()
@ApiTags('booking')
export class BookingController {
    constructor(
        @Inject(BOOKING_SERVICE)
        private readonly bookingService: IBookingService
    ) { }

    @Get('available-vehicle-booking-hour/:date/:startTime/:durationMinutes')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get available vehicle category, number and price for booking hour when customer provide time and duration' })
    @ApiParam({
        name: 'date',
        description: 'date customer want to book',
        example: '2025-02-17',
    })
    @ApiParam({
        name: 'startTime',
        description: 'startTime customer want to book',
        example: '11:00',
    })
    @ApiParam({
        name: 'durationMinutes',
        description: 'durationMinutes customer want to book',
        example: 30
    })
    async getAvailableVehicleBookingHour(
        @Param('date') date: string,
        @Param('startTime') startTime: string,
        @Param('durationMinutes') durationMinutes: number,

    ) {
        return await this.bookingService.findAvailableVehicleBookingHour(date, startTime, durationMinutes)
    }
}