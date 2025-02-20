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


    @Get('available-vehicle-booking-scenic-route/:date/:startTime/:scenicRouteId')
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
        name: 'scenicRouteId',
        description: 'scenicRouteId customer want to book',
        example: ''
    })
    async getAvailableVehicleBookingScenicRoute(
        @Param('date') date: string,
        @Param('startTime') startTime: string,
        @Param('scenicRouteId') scenicRouteId: string,

    ) {
        return await this.bookingService.findAvailableVehicleBookingScenicRoute(scenicRouteId, date, startTime)
    }



    @Get('available-vehicle-booking-scenic-route/:startPoint/:endPoint/:estimatedDuration/:estimatedDistance')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get available vehicle category, number and price for booking hour when customer provide time and duration' })
    @ApiParam({
        name: 'startPoint',
        description: 'startPoint of customer',
        example: {
            "lat": 10.83775,
            "lng": 106.83796
        },
    })
    @ApiParam({
        name: 'endPoint',
        description: 'endPoint customer want to book',
        example: {
            "lat": 10.8474,
            "lng": 106.83683
        },
    })
    @ApiParam({
        name: 'estimatedDuration',
        description: 'estimatedDuration customer want to book',
        example: 5
    })
    @ApiParam({
        name: 'estimatedDistance',
        description: 'estimatedDistance customer want to book',
        example: 2
    })
    async getAvailableVehicleBookingDestination(
        @Param('startPoint') startPoint: object,
        @Param('endPoint') endPoint: object,
        @Param('estimatedDuration') estimatedDuration: number,
        @Param('estimatedDistance') estimatedDistance: number,

    ) {
        return await this.bookingService.findAvailableVehicleBookingDestination(startPoint, endPoint, estimatedDuration, estimatedDistance)
    }

}