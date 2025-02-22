import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { RolesGuard } from "src/modules/auth/role.guard";
import { BOOKING_SERVICE } from "src/modules/booking/booking.di-token";
import { IBookingDestinationBody, IBookingHourBody, IBookingScenicRouteBody } from "src/modules/booking/booking.dto";
import { IBookingService } from "src/modules/booking/booking.port";
import { UserRole } from "src/share/enums";

@ApiTags('booking')
@Controller('booking')
export class BookingController {
    constructor(
        @Inject(BOOKING_SERVICE)
        private readonly bookingService: IBookingService
    ) { }

    @Post('create-booking-hour')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth('authorization')
    @ApiBody({
        type: Object,
        description: 'Create a Booking Hour and their Trip for customer',
        examples: {
            'Create a Booking Hour and their Trip for customer': {
                value: {
                    startPoint: {
                        lat: 10.8358,
                        lng: 106.84286,
                    },
                    date: '2025-02-17',
                    startTime: '11:00',
                    durationMinutes: 30,
                    vehicleCategories: [
                        {
                            categoryVehicleId: '67873bb9cf95c847fe62ba5f',
                            quantity: 2
                        }
                    ],
                    paymentMethod: 'pay_os'
                }
            }
        }
    })
    async bookingHour(
        @Request() req,
        @Body() data: IBookingHourBody,
    ) {
        return await this.bookingService.bookingHour(
            req.user._id,
            data
        )
    }


    @Post('create-booking-scenic-route')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth('authorization')
    @ApiBody({
        type: Object,
        description: 'Create a Booking Scenic route and their Trip for customer',
        examples: {
            'Create a Booking Scenic route and their Trip for customer': {
                value: {
                    startPoint: {
                        lat: 10.8358,
                        lng: 106.84286,
                    },
                    scenicRouteId: '67ba067fa6cb16fffb59a4e4',
                    date: '2025-02-17',
                    startTime: '11:00',
                    vehicleCategories: [
                        {
                            categoryVehicleId: '67873bb9cf95c847fe62ba5f',
                            quantity: 2
                        }
                    ],
                    paymentMethod: 'pay_os'
                }
            }
        }
    })
    async bookingScenicRoute(
        @Request() req,
        @Body() data: IBookingScenicRouteBody,
    ) {
        return await this.bookingService.bookingScenicRoute(
            req.user._id,
            data
        )
    }


    @Post('create-booking-destination')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth('authorization')
    @ApiBody({
        type: Object,
        description: 'Create a Booking destination and their Trip for customer',
        examples: {
            'Create a Booking destination and their Trip for customer': {
                value: {
                    startPoint: {
                        lat: 10.8334,
                        lng: 106.8420,
                    },
                    endPoint: {
                        lat: 10.8479,
                        lng: 106.8357,
                    },
                    estimatedDuration: 7,
                    distanceEstimate: 2.8,
                    vehicleCategories:
                    {
                        categoryVehicleId: '67873bb9cf95c847fe62ba5f',
                    },
                    paymentMethod: 'pay_os'
                }
            }
        }
    })
    async bookingDestination(
        @Request() req,
        @Body() data: IBookingDestinationBody,
    ) {
        return await this.bookingService.bookingDestination(
            req.user._id,
            data
        )
    }

}